import { NavBar } from '../components/NavBar';
import { customStylesSingle } from '../components/styles/dropdownSingle';
import { getCrowdinProjects, getCrowdinFiles } from '../../services/api';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';


interface CrowdinOption {
    value: number;
    label: string;
}

interface CrowdinResponse {
    data: {
        name: string,
        id: number
    }
}

export function FileUploadPage() {

    const [selectedProject, setSelectedProject] = useState<CrowdinOption | null>(null);
    const [selectedFile, setSelectedFile] = useState<CrowdinOption | null>(null)

    const getProjects = async () => {
        try {
            const response: CrowdinResponse[] = await getCrowdinProjects()
            return response.map(item => ({
                value: item.data.id,
                label: item.data.name
            }))
        } catch (error) {
            console.error("Error loading Crowdin projects:", error)
            return []
        }
    }

    const getFiles = async (projectId: number | undefined) => {
        if (!projectId) return []
        try {
            const response: CrowdinResponse[] = await getCrowdinFiles(projectId)
            return response.map(item => ({
                value: item.data.id,
                label: item.data.name
            }))
            
            
        } catch (error) {
            console.error("Error loading Crowdin projects:", error)
            return []
        }
    }
   


    return (
        <>
            <NavBar />
            <div>
                <AsyncSelect<CrowdinOption, false>
                    isClearable
                    isSearchable
                    defaultOptions
                    styles={customStylesSingle}
                    value={selectedProject}
                    loadOptions={getProjects}
                    onChange={(option) =>{
                        setSelectedProject(option)
                        setSelectedFile(null)
                    }}
                 />
            </div>
            <div>
                {selectedProject ? 
                    <AsyncSelect<CrowdinOption, false>
                        key={selectedProject.value}
                        isClearable
                        isSearchable
                        defaultOptions
                        styles={customStylesSingle}
                        value={selectedFile}
                        loadOptions={(input) => getFiles(selectedProject.value)}
                        onChange={(option) => setSelectedFile(option)}
                    /> 
                 : null
                 }
                
            </div>
            
        </>
    )
}
