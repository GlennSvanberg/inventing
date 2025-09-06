// Shared type definitions for the application

export interface TemplateImage {
  id: string;
  file_path: string;
  file_name: string;
  public_url: string;
  uploaded_at: string;
  file?: File; // Optional for temporary images before upload
}

export interface Template {
  id?: string;
  name: string;
  description?: string;
  prompt: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  template_images?: TemplateImage[];
}
