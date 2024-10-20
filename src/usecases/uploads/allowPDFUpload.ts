import { isPDFFile } from '../../lib/storage/checks';

export const allowPDFUpload = (
  fileName: string,
  premium: boolean,
  vertexAIPDFQuestions: boolean
): null | false | boolean => {
  return isPDFFile(fileName) && premium && vertexAIPDFQuestions;
};
