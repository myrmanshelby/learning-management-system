import React, { useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, TableContainer, Paper, Table, TableRow, TableHead, TableCell, TableBody } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { TutoringAPI } from '../../proxy/tutor-backend/TutorBackendProxy';
import { CheckProcessingStatusOutput, StartProcessingOutput } from '../../../models/frontend-models';
import { ContentPiece } from '../../../services/bookProcessorService';
import { Padding } from '@mui/icons-material';
import { Class } from '../../../models/frontend-models'

interface TeacherUploadProps {
  getCreatorId?: () => string;
  onUploadComplete?: (newClass: Class) => void;
}

const TeacherUpload: React.FC<TeacherUploadProps> = ({ getCreatorId: getCreatorId, onUploadComplete: onUploadComplete }) => {
  const [processingBook, setProcessingBook] = useState(false);
  const [contents, setContents] = useState<ContentPiece[]>([]);
  const [componentSourceId, setComponentSourceId] = useState<string>(null);
  const [fileName, setFileName] = useState<string>(null);

  const tutoringApi = new TutoringAPI()

  // TODO move into API object 
  const handleUpload = async (selectedFile): Promise<StartProcessingOutput> => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3000/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data
    } catch (error: any) {
      console.error('Error uploading file', error.response?.data || error.message);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {

      const selectedFile = event.target.files[0]
      const fileName = event.target.files[0].name
      
      // we are processing their book and should indicate it 
      setFileName(fileName)
      setProcessingBook(true)

      // TODO handle error ? 
      const startProcessingResult: StartProcessingOutput = await handleUpload(selectedFile);
      const sourceId = startProcessingResult.sourceID
      
      const intervalId = setInterval(async () => {
        console.log(`Checking status for ${sourceId}`)
        const result = await tutoringApi.getTableOfContents({
          sourceID: sourceId
        })
        if (result.status != "processing" && result.contents.length > 0) {
          clearInterval(intervalId)
          setProcessingBook(false)
          setContents(result.contents)
          setComponentSourceId(sourceId)
        }
      }, 500); // Poll every 500 milliseconds (half second)
    }
  };

  const handleApproveContents = async () => {
    console.log("Creating class...")
    console.log(contents)
    console.log(getCreatorId())
    console.log(componentSourceId)
    const response = await tutoringApi.createClass({
      title: "Placeholder",
      sourceID: componentSourceId,
      creatorID: getCreatorId(),
      contents: contents,
      filepath: fileName
    })
    console.log("Created class...")
    onUploadComplete(response.class)
  }

  return (
    <Container>
      { processingBook ? 
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
            <CircularProgress />
            <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
            One moment, while we extract the table of contents...
            </Typography>
          </Box>
          : 
            null
      }

      { !processingBook && contents.length == 0 ?
          <Box textAlign="center" my={5}>
            <Typography variant="subtitle1" my={2}>
              <p>Upload a source to create a new class!</p>
            </Typography>
            <Button variant="contained" component="label" startIcon={<UploadFileIcon />} >
              Upload Your Book (.pdf only)
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Box> : null
        }
      { contents.length > 0 ? 
          <div>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
              <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
                How does this look?
              </Typography>
          </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Section</TableCell>
                        <TableCell>Chapter Title</TableCell>
                        <TableCell>Page</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {
                    contents.map((content) => (
                      <TableRow>
                        <TableCell> {content.numeral} </TableCell>
                        <TableCell> {content.name} </TableCell>
                        <TableCell> {content.page} </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <Box textAlign="center" my={5}>
              <Button variant="contained" onClick={handleApproveContents}>
                Looks good to me
              </Button>
            </Box>
          </div>
        : null
    }
      
    </Container>
  );
};

export default TeacherUpload;