// Google Classroom API Client Service for FatherTimeSDKP Educational Suite
// Scopes configured via set_up_oauth for project gen-lang-client-0313136968

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  workType?: string;
  maxPoints?: number;
}

export interface ClassroomListResponse {
  courses?: ClassroomCourse[];
  nextPageToken?: string;
}

/**
 * List Google Classroom courses where user is a teacher or student.
 */
export async function listClassroomCourses(
  accessToken: string,
  pageSize: number = 20
): Promise<ClassroomCourse[]> {
  const params = new URLSearchParams({
    pageSize: String(pageSize),
  });

  const res = await fetch(`https://classroom.googleapis.com/v1/courses?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Classroom courses (${res.status})`);
  }

  const data: ClassroomListResponse = await res.json();
  return data.courses || [];
}

/**
 * Create a new Google Classroom course.
 */
export async function createClassroomCourse(
  accessToken: string,
  course: {
    name: string;
    section?: string;
    descriptionHeading?: string;
    description?: string;
  }
): Promise<ClassroomCourse> {
  const res = await fetch('https://classroom.googleapis.com/v1/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ...course,
      ownerId: 'me',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create Classroom course (${res.status})`);
  }

  return await res.json();
}

/**
 * List coursework items for a course.
 */
export async function listCourseWork(
  accessToken: string,
  courseId: string
): Promise<ClassroomCourseWork[]> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch coursework (${res.status})`);
  }

  const data = await res.json();
  return data.courseWork || [];
}

/**
 * Publish a research treatise as coursework assignment into a course.
 */
export async function publishResearchToCourse(
  accessToken: string,
  courseId: string,
  title: string,
  description: string
): Promise<ClassroomCourseWork> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
      workType: 'ASSIGNMENT',
      state: 'PUBLISHED',
      maxPoints: 100,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to publish research to Google Classroom (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete a course (requires explicit confirmation).
 */
export async function deleteClassroomCourse(
  accessToken: string,
  courseId: string
): Promise<boolean> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete Classroom course (${res.status})`);
  }

  return true;
}
