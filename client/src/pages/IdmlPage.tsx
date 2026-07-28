import { NavBar } from '../components/NavBar';
import { customStyles } from '../components/styles/dropdowns';
import { getCrowdinProjects } from '../../services/api';
import { useEffect } from 'react';
import Async, { useAsync } from 'react-select/async';
import Select from 'react-select'
import AsyncSelect from 'react-select/async';

export function FileUploadPage() {

    useEffect(() => {
        const crowdinProjects = getCrowdinProjects()
    }, [getCrowdinProjects])
    
   


    return (
        <>
            <NavBar />
            <div>
                <AsyncSelect
                    isClearable
                    isSearchable
                    styles={customStyles}

                 />
            </div>
            
        </>
    )
}
