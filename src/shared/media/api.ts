export interface PresignRequest { filename: string; mime: string }
export interface PresignResponse { uploadUrl: string; fileUrl: string; headers?: Record<string,string> }

export async function presignForUpload(req: PresignRequest): Promise<PresignResponse> {
  // mock presign: generate fake S3 URLs; in real life call REST: POST /files/presign
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const uploadUrl = `https://mock-storage/upload/${id}?filename=${encodeURIComponent(req.filename)}`;
  const fileUrl = `https://mock-storage/files/${id}/${encodeURIComponent(req.filename)}`;
  return { uploadUrl, fileUrl, headers: { 'x-mock': '1' } };
}

// Mock PUT upload to S3 signed URL
export async function uploadToPresignedUrl(url: string, _file: Blob, _headers?: Record<string,string>): Promise<void> {
  // no-op mock; in real life we'd PUT to `url`
  void url; void _file; void _headers;
  return Promise.resolve();
}

// Mock download: returns the same URL for <img src>, or a DataURL if needed
export async function downloadFromUrl(url: string): Promise<string> {
  // In a real app, fetch blob and return object URL or DataURL
  return Promise.resolve(url);
}
