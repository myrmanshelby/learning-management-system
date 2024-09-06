import axios from 'axios';

export interface GetTableOfContentsRequest {
  sourceID: string;
}

export interface GetTableOfContentsResponse {
  contents: ContentPiece[];
}

export interface ProcessTableOfContentsRequest {
  sourceID: string;
  fileName: string;
}

export interface ContentPiece {
  name: string
  numeral: string
  page: number
}

export interface TOCStatus {
  status: "ready" | "processing"
  contents?: ContentPiece[]
}

export interface ProcessTableOfContentsResponse {
  status: string;
}

export const startProcessingTableOfContents = async (request: ProcessTableOfContentsRequest): Promise<ProcessTableOfContentsRequest> => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/v1/book/toc',
      request,
      {
        headers: {
          'Content-Type': 'application/json',
      }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error for handling in the caller
  }
};

export const getTableOfContentsProcessingStatus = async (sourceId: string): Promise<TOCStatus> => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/book/toc/${sourceId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error for handling in the caller
  }
};

export interface GetLearningObjectivesRequest {
  filepath: string
  page: number
}

export interface GetLearningObjectivesResponse {
  objectives: string[];
}

export const getLearningObjectives = async (request: GetLearningObjectivesRequest): Promise<GetLearningObjectivesResponse> => {
  try {
    const response = await axios.get(`http://localhost:8000/api/v1/book/learning-objectives/${request.filepath}/${request.page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; 
  }
};
