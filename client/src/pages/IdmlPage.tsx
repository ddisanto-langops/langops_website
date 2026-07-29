import { NavBar } from '../components/NavBar';
import { customStylesSingle } from '../components/styles/dropdownSingle';
import { getCrowdinProjects, getCrowdinFiles, getStringMap } from '../../services/api';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { StringMapResponse } from '@shared/types';


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
    const [stringMap, setStringMap] = useState<StringMapResponse | null>(null)

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

    const fetchStringMap = async (projectId: number | string, fileId: number | string) => {
        if (!projectId || !fileId) return null

        try {
            const response: StringMapResponse | null = await getStringMap(projectId, fileId)
            setStringMap(response)
            return response
        } catch (error) {
            console.error("Error fetching string map:", error)
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
            <div>
                {
                    selectedFile && selectedProject ?
                    <button className='interactive-button' onClick={() => fetchStringMap(selectedProject.value, selectedFile.value)}>
                        Fetch String Map
                    </button> :
                    null
                }
                
            </div>
            <div>
                {
                    stringMap ?
                    stringMap.data.map((item) => {
                        return (
                            <div>
                                <span>Preview for story: {item.contextIdentifier}</span>
                                <span>Strings:
                                    <div>{item.map.strings}</div>
                                </span>
                                <input placeholder='Name this article...'></input>
                                <button>Label Article</button>
                            </div>
                        )
                    }) : null
                }
            </div>
        </>
    )
}
