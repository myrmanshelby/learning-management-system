from PyPDF2 import PdfReader
import google.generativeai as genai
import re
import os
import json
from pydantic import BaseModel
from flask import Flask, request, jsonify
from flask_cors import CORS
from statistics import mode
from threading import Thread

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/book/toc', methods=['POST'])
def process_book_api():
    data = request.get_json()
    sourceID = data.get('sourceID')
    fileName = data.get('fileName')

    if not sourceID:
        return jsonify({'error': 'sourceID is required'}), 400
    if not fileName:
        return jsonify({'error': 'fileName is required'}), 400

    thread = Thread(target=process_book, kwargs={'sourceID': sourceID, 'fileName': fileName})
    thread.start()

    return jsonify({
        'status': 'started',
        'sourceID': sourceID
    })

@app.route('/api/v1/book/toc/<sourceID>/status', methods=['GET'])
def check_processing_status(sourceID):
    if not sourceID:
        return jsonify({'error': 'sourceID is required'}), 400

    book_path = f"output/{sourceID}.json"
    processing_finished = os.path.isfile(book_path)

    data = []
    if processing_finished: 
        with open(book_path, 'r') as f:
            data = json.load(f)
            return data
        
    return jsonify({
        'status': 'ready' if processing_finished else 'processing',
        'contents': data
    })


@app.route('/api/v1/book/learning-objectives/<book_name>/<page_number>', methods=['GET'])
def extract_learning_objection_api(book_name,page_number):
    if not page_number:
        return jsonify({'error': 'Page number is required'}), 400
    
    return jsonify({
        'page_number': page_number,
        'objectives': get_objectives(book_name, int(page_number))
    })

model = genai.GenerativeModel('gemini-1.5-flash')

GEMINI_API_KEY=os.environ["GEMINI_API_KEY"]

genai.configure(api_key=GEMINI_API_KEY)

class ContentPiece(BaseModel): 
    name: str
    numeral: str
    page: int

class TableOfContents(BaseModel):
    contents: list[ContentPiece]

def get_one_adjustor(pdf_name, pdf_page_num):
    """
    Takes in a pdf file destination and the page number to access using PdfReader.
    Returns the difference between the page number on the pdf document and the
    page number PdfReader is accessing.
    """
    reader = PdfReader(pdf_name)
    page = reader.pages[pdf_page_num]
    page_text = page.extract_text()

    # Regex pattern to find numbers
    page_number_pattern = re.compile(r'\b\d+\b')
    
    # Split text into lines to check top and bottom lines
    lines = page_text.splitlines()
    
    # Combine first few lines and last few lines to search for page number
    top_lines = ' '.join(lines[:3])
    bottom_lines = ' '.join(lines[-3:])
    
    # Find all numbers in the top and bottom lines
    matches = page_number_pattern.findall(top_lines) + page_number_pattern.findall(bottom_lines)
    
    # Return the first valid match, prioritizing bottom over top
    prox = 500000
    if matches:
         for match in matches:
             if abs(int(match)-pdf_page_num)<prox:
                 prox=abs(int(match)-pdf_page_num)
    return prox

def get_mode_adjustor(pdf_name, pdf_page_num, num_pages):
    """
    Takes in pdf file destination, the page number to access using PdfReader,
    the number of pages to access past pdf_page_num. Returns the most common value
    returned by get_one_adjustor() for pages in the range [pdf_page_num, num_pages]
    """
    prox_list = []
    for i in range(num_pages):
        prox_list.append(get_one_adjustor(pdf_name,pdf_page_num+i))

    return mode(prox_list)

def find_toc_pages(reader):
    """
    Takes in pdf file destination.
    Returns a tuple (a, b) where a = the first page of the table of contents,
    and b = the second page of the table of contents.
    """
    toc_start = 0
    
    for i in range(0, reader._get_num_pages()):
        page = reader.pages[i]
        if (('Contents' in page.extract_text()) or ('contents' in page.extract_text()) 
            or ('Table' in page.extract_text())) and ('Chapter' in page.extract_text()):
            toc_start=i
            break

    toc_end = toc_start
    for i in range(toc_start+1, reader._get_num_pages()):
        page = reader.pages[i]
        response = model.generate_content("Is the following page a table of contents page? Reply with"
                                          + " only Y or N. Here is the page: " + page.extract_text())
        if (response.text.strip() == 'N'):
            toc_end = i - 1
            break

    
    return toc_start, toc_end


def toc_page_to_list(toc_start, toc_stop, pdf_name, reader):
    """
    Takes in the first table of contents page, the last table of contents page,
    and the pdf file destination. Returns a list of lists in the format 
    ['Section Name', chapter_number.section_number, page_number]
    """
    

    table_of_contents = ''
    for i in range(toc_start, toc_stop+1):
        page = reader.pages[i]
        table_of_contents += '\n'+page.extract_text()

    response = model.generate_content("Using the table of contents below, please return a series of lists in the format" 
                                  + " \"Section Name, chapter.section, page number\", where chapter.section would be" 
                                  + " 1.1 if it were the first section of chapter 1. The chapter title should have" 
                                  + " a section number of 0, so the for the first chapter, chapter.section would be 1.0." 
                                  + " Please return each list on a separate line. Please edit any typos in the"
                                  + " section name, and ignore any sections that say preface, chapter review, exercises, or "
                                  + " are before the first chapter or after the last section of the last chapter." 
                                  + " Here is the table of contents: \n" + table_of_contents)

    toc_list = response.text.splitlines()
    adjustor = get_mode_adjustor(pdf_name, toc_stop+20,35)

    for i in range(len(toc_list)):
        toc_list[i] = toc_list[i].split(', ')
        if len(toc_list[i])>3:
            toc_list[i][0:(len(toc_list[i])-2)] = [', '.join(toc_list[i][0:(len(toc_list[i])-2)])] # Accounts for chapter titles with commas
        toc_list[i][2]=eval(toc_list[i][2])+adjustor # Gets correct page for pdf viewer

    return toc_list

def get_objectives(fileName: str, page_number: int):
    """
    Returns a list of learning objects on page page_number in the file pdf_name
    """
    book_path = f"uploads/{fileName}"
    if not os.path.isfile(book_path):
        print(f"{book_path} That file does not exist")
        return

    reader = PdfReader(book_path)
    page = reader.pages[page_number]
    response = model.generate_content("Find the list of learning objectives in the text below, and" 
                                      + " return only each learning objective on a separate line. If the list" 
                                      + " begins with numbers, please remove the numbers. Please try to"
                                      + " keep the learning objectives close to or matching the original text."
                                      + " Here is the text: \n" + page.extract_text())
    
    result = response.text.splitlines()
    print(result)
    return result

def process_book(sourceID, fileName):

    print(f"Starting Book Processing for {sourceID}")

    book_path = f"uploads/{fileName}"
    if not os.path.isfile(book_path):
        print("That file does not exist")
        return

    reader = PdfReader(book_path)

    # Check if we already processed this book before 
    input_file_name = os.path.basename(book_path)
    output_file_name = os.path.basename(f"{sourceID}.json")

    if os.path.isfile(output_file_name):
        print("We've already processed that file.")
        return

    start, end = find_toc_pages(reader)
    book_structure = toc_page_to_list(start, end, book_path, reader)
    contents: list[ContentPiece] = [
        ContentPiece(
            name=bs[0],
            numeral=bs[1],
            page=int(bs[2]),
        ) for bs in book_structure
    ]
    result_table_of_contents = TableOfContents(
        contents=contents
    )

    with open(f"output/{output_file_name}", 'w') as f:
        f.write(result_table_of_contents.model_dump_json(indent=2))

# Runs the server
if __name__ == "__main__":
    app.run(port=8000, debug=True)
