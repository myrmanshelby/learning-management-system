import axios from 'axios';
import { CheckProcessingStatusInput, CheckProcessingStatusOutput, Class, CreateClassInput, CreateClassOutput, GenerateProblemsInput, GenerateProblemsOutput, GetChaptersAndSectionsInput, GetChaptersAndSectionsOutput, GetClassInput, GetLearningObjectivesInput, GetProblemsInput, GetProblemsOutput, GetUserByEmailInput, GetUserByEmailOutput, ListClassesInput, ListClassesOutput, User } from '../../../models/frontend-models';

export class TutoringAPI {
    private baseUrl = 'http://localhost:3000';

    async createClass(input: CreateClassInput): Promise<CreateClassOutput> {
      try {
        const response = await axios.post<CreateClassOutput>(
          `${this.baseUrl}/api/class/create`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async listClasses(input: ListClassesInput): Promise<ListClassesOutput> {
      try {
        const response = await axios.post<ListClassesOutput>(
          `${this.baseUrl}/api/classes`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async getClass(input: GetClassInput): Promise<Class> {
      try {
        const response = await axios.post<Class>(
          `${this.baseUrl}/api/class`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async getUserByEmail(input: GetUserByEmailInput): Promise<User> {
      try {
        const response = await axios.post<User>(
          `${this.baseUrl}/api/user`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async getTableOfContents(input: CheckProcessingStatusInput): Promise<CheckProcessingStatusOutput> {
      try {
        const response = await axios.post<CheckProcessingStatusOutput>(
          `${this.baseUrl}/api/book/status`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async getLearningObjectives(input: GetLearningObjectivesInput): Promise<GetLearningObjectivesInput> {
      try {
        const response = await axios.post<GetLearningObjectivesInput>(
          `${this.baseUrl}/api/objectives`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching objectives:', error);
        throw error;
      }
    } 
  
    async getChaptersAndSections(input: GetChaptersAndSectionsInput): Promise<GetChaptersAndSectionsOutput> {
      try {
        const response = await axios.post<GetChaptersAndSectionsOutput>(
          `${this.baseUrl}/api/chapters`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async generateProblems(input: GenerateProblemsInput): Promise<GenerateProblemsOutput> {
      try {
        const response = await axios.post<GenerateProblemsOutput>(
          `${this.baseUrl}/api/create-problem-set`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }

    async getProblems(input: GetProblemsInput): Promise<GetProblemsOutput> {
      try {
        const response = await axios.post<GetProblemsOutput>(
          `${this.baseUrl}/api/problem-set`,
          input,
          {
            headers: {
              'Content-Type': 'application/json',
          }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }
}