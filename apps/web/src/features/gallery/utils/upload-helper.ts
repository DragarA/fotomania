/**
 * Upload file with progress tracking using XMLHttpRequest
 * (fetch() doesn't support upload progress)
 */
export function uploadWithProgress(
  url: string,
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    // Handle successful response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        // Try to parse error message from response
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || xhr.statusText));
        } catch {
          reject(new Error(xhr.statusText));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    xhr.send(formData);
  });
}
