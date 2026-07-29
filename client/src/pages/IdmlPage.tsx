import { NavBar } from '../components/NavBar';
import { customStylesSingle } from '../components/styles/dropdownSingle';
import { getCrowdinProjects, getCrowdinFiles, getStringMap, labelIdml } from '../../services/api';
import React, { useState } from 'react';
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
    
    const handleStringMapChange = (contextIdentifier: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (stringMap) {
            const title = e.target.value
            setStringMap((prev) => {
                if (!prev) return null
                return {
                    ...prev,
                    data: prev.data.map((item) => {
                        if (item.contextIdentifier !== contextIdentifier) {
                            return item
                        }
                        return {...item, map: {...item.map, labelText: title}}
                    })
                }
            })
        }
    }


    const labelStrings = () => {
        if (!stringMap) return null
        const projectId = Number(selectedProject?.value)
        labelIdml(projectId, stringMap?.data)
    }
   


    return (
        <>
            <NavBar />
            <div>
                <AsyncSelect<CrowdinOption, false>
                    isClearable
                    isSearchable
                    defaultOptions
                    placeholder="Select a project..."
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
                        placeholder="Select a file..."
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
                    <div>
                        <button className='interactive-button' onClick={() => fetchStringMap(selectedProject.value, selectedFile.value)}>
                            Extract Articles
                        </button>
                        {
                            stringMap ?
                            <button className='interactive-button' onClick={() => setStringMap(null)}>
                                Clear
                            </button>
                            : null
                        }
                        
                    </div>
                    :
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
                                <input placeholder='Name this article...' value={item.map.labelText ?? ''} onChange={(e) => handleStringMapChange(item.contextIdentifier, e)}></input>
                            </div>
                        )
                    })
                     : null
                }
            </div>
            <div>
                {
                    stringMap ?
                    <button className='interactive-button' onClick={() => {
                        labelStrings
                        setStringMap(null)
                        }}>
                        Label Articles
                    </button>
                    : null
                }
            </div>
        </>
    )
}
