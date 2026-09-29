// Google Docs API Client Service for FatherTimeSDKP & Digital Crystal Protocol
// Scopes configured via set_up_oauth for project gen-lang-client-0313136968

export interface GoogleDocResult {
  documentId: string;
  title: string;
  webViewLink: string;
  revisionId?: string;
}

/**
 * Create a new Google Doc and insert formatted research text.
 */
export async function createGoogleDoc(
  accessToken: string,
  title: string,
  initialText: string
): Promise<GoogleDocResult> {
  // Step 1: Create the empty document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create Google Doc (${createRes.status})`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // Step 2: Insert the content via batchUpdate if text provided
  if (initialText && initialText.trim().length > 0) {
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: initialText,
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      console.warn('Document created, but initial text insert failed');
    }
  }

  return {
    documentId,
    title: docData.title || title,
    webViewLink: `https://docs.google.com/document/d/${documentId}/edit`,
    revisionId: docData.revisionId,
  };
}

/**
 * Retrieve document structure and text from Google Docs.
 */
export async function getGoogleDoc(accessToken: string, documentId: string): Promise<any> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to get Google Doc (${res.status})`);
  }

  return await res.json();
}

/**
 * Append research section to an existing Google Doc.
 */
export async function appendTextToGoogleDoc(
  accessToken: string,
  documentId: string,
  text: string
): Promise<boolean> {
  const doc = await getGoogleDoc(accessToken, documentId);
  const endIndex = doc.body?.content?.[doc.body.content.length - 1]?.endIndex || 1;
  const insertIndex = Math.max(1, endIndex - 1);

  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: insertIndex,
            },
            text: `\n\n${text}`,
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to append text to Google Doc (${updateRes.status})`);
  }

  return true;
}
