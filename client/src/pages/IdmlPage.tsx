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
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [isLabeling, setIsLabeling] = useState<boolean>(false);

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
        setIsExtracting(true)
        try {
            const response: StringMapResponse | null = await getStringMap(projectId, fileId)
            setStringMap(response)
            return response
        } catch (error) {
            console.error("Error fetching string map:", error)
            return []
        } finally {
            setIsExtracting(false)
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
        try {
            setIsLabeling(true)
            const projectId = Number(selectedProject?.value)
            labelIdml(projectId, stringMap?.data)
        } catch (error) {
            console.error("Error fetching string map:", error)
        } finally {
            setIsLabeling(false)
        }
    }
   


    return (
        <>
            <NavBar />
            <div className='idml-select-div'>
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
                    <div className='idml-buttons-div'>
                        <button disabled={stringMap ? true : false} className='interactive-button' onClick={() => fetchStringMap(selectedProject.value, selectedFile.value)}>
                            { isExtracting ? "Extracting..." : "Extract Articles"}
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
                            <div className='idml-article-div' key={item.contextIdentifier}>
                                <div className='idml-text-div'><p>{item.map.strings}</p></div>
                                <input className='idml-input' placeholder='Name this article...' value={item.map.labelText ?? ''} onChange={(e) => handleStringMapChange(item.contextIdentifier, e)}></input>
                            </div>
                        )
                    })
                     : null
                }
            </div>
            <div className='idml-buttons-div'>
                {
                    stringMap ?
                    <button className='interactive-button' onClick={() => {
                        labelStrings
                        setStringMap(null)
                        }}>
                        {isLabeling ? "Labeling..." : "Label Articles"}
                    </button>
                    : null
                }
            </div>
        </>
    )
}
