// Google Drive API Client Service for FatherTimeSDKP Research Suite
// Scopes configured via set_up_oauth for project gen-lang-client-0313136968

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  shared?: boolean;
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

/**
 * List files from the user's Google Drive.
 */
export async function listDriveFiles(
  accessToken: string,
  options?: {
    pageSize?: number;
    query?: string;
    pageToken?: string;
  }
): Promise<DriveListResponse> {
  const params = new URLSearchParams({
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, shared)',
    pageSize: String(options?.pageSize || 25),
    orderBy: 'modifiedTime desc',
  });

  if (options?.query) {
    params.set('q', `name contains '${options.query.replace(/'/g, "\\'")}' and trashed = false`);
  } else {
    params.set('q', 'trashed = false');
  }

  if (options?.pageToken) {
    params.set('pageToken', options.pageToken);
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch files from Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Create or upload a file to Google Drive using multipart upload.
 */
export async function uploadDriveFile(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/markdown',
  parentFolderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to upload file to Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive.
 * Note: Must only be called after user confirmation in UI.
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file from Google Drive (${res.status})`);
  }

  return true;
}

/**
 * Find or create a dedicated "FatherTimeSDKP Research Vault" folder in Google Drive.
 */
export async function getOrCreateResearchFolder(accessToken: string): Promise<string> {
  const folderName = 'FatherTimeSDKP Research Vault';
  const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Unified storage for FatherTimeSDKP research papers, equations, and cross-chain bridge logs.',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to initialize research folder in Google Drive');
  }

  const folder = await createRes.json();
  return folder.id;
}
