import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { NavBar } from '../components/NavBar';

export function FileUploadPage() {
    
    return (
        <>
            <NavBar />
            <FileUpload />
        </>
    )
}
