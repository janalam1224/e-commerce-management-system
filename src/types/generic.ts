
export interface DocumentData {
  id: string;
  data: any;
}

export interface PostDocumentResponse {
  status: number;
  message?: string;
  id?: string;
  error?: any;
}

export interface FindDocumentResponse {
  status: number;
  data?: any;
  message?: string;
}

export interface EditDocumentResponse {
  status: number;
  message: string;
}


export interface DeleteDocumentResponse {
  status: number;
  message: string;
}