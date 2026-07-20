import { ProjectsGroups } from '@crowdin/crowdin-api-client';

/**
 * Fetches all Crowdin projects and maps them to a dictionary.
 * Use this to automatically refresh the list of Crowdin projects in constants.ts
 * if a new project is created or one is deleted. 
 * Dictionary is formated as: { [lowerCaseProjectName]: projectId }
 * 
 * @param token Your Crowdin Personal Access Token
*/
async function getProjectDictionary(token: string): Promise<Record<string, string>> {
  const projectsGroupsApi = new ProjectsGroups({ token });
  const projectDictionary: Record<string, string> = {};

  try {
    // The response is an object wrapper of type ResponseList
    const response = await projectsGroupsApi.withFetchAll().listProjects();

    // FIX: Iterate through response.data, which is the actual native array
    response.data.forEach((responseObject) => {
      const project = responseObject.data;
      
      const normalizedName = project.name.toLowerCase().replace("_", "");
      const projectId = project.id.toString();

      projectDictionary[normalizedName] = projectId;
    });

    return projectDictionary;
  } catch (error) {
    console.error('Error fetching projects from Crowdin:', error);
    throw error;
  }
}

const token = process.env.crowdinToken
if (token) {
    const projects = await getProjectDictionary(token)
    console.log(projects)
}
