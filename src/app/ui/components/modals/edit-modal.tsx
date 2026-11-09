"use client"

import { ChangeEvent, useState } from 'react';
import { LangOpsProduct } from "@/app/lib/types";
import { capitalize, dateTimeFormat } from '@/app/lib/functions';
import CopyButton from '@/app/ui/components/copy-button'
import { statusEnum, supportedLanguageEnum } from '@/app/lib/enums';
import ISO6391 from 'iso-639-1'
import { useRouter } from 'next/navigation';

interface ModalDetailsProps {
  product: LangOpsProduct
}

export function EditModal({ product }: ModalDetailsProps) {
    const inputStyles = "rounded-md bg-sky-500/50 p-2 text-white overflow-scroll"
    const selectStyles = "field-sizing-content rounded-md bg-sky-500/50 p-2 cursor-pointer text-white"

    const router = useRouter() // using this to navigate out of modal

    // 1. Initialize state with normalized strings so inputs can mutate them naturally
    const [modalData, setModalData] = useState({
        ...product,
        trelloData: {
            ...product.trelloData,
            // Format dates immediately upon state initialization so they match input values
            dueDate: dateTimeFormat(product.trelloData.dueDate),
            dateLastActivity: dateTimeFormat(product.trelloData.dateLastActivity),
        }
    })

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.') as [string, string];
            
            setModalData((prev) => ({
                ...prev,
                [parentKey]: {
                    ...(prev[parentKey as keyof typeof prev] as Record<string, unknown>),
                    [childKey]: value
                }
            }));
        } else {
            setModalData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }

    const handleCancel = () => {
        setModalData(product)
        router.back()

    }
    
    return (
        <>
        <span className="block text-center font-bold text-white text-xl p-4">
            Edit Product
        </span>
        <div className="flex flex-row justify-self-center gap-6 m-6">
            <CopyButton buttonText='Copy Trello URL' textToCopy={modalData.trelloData.url} />
        </div>
            
        <div className="text-white grid grid-cols-[0.2fr_1fr] p-4 gap-4 items-center text-right w-[80%] justify-self-center">
            <h2>Title:</h2>
            <input 
                name="trelloData.title"
                value={modalData.trelloData.title}
                className={inputStyles}
                onChange={handleChange}
            />

            <h2>Localized Title:</h2>
            <input 
                name="trelloData.localizedTitle"
                value={modalData.trelloData.localizedTitle}
                className={inputStyles}
                onChange={handleChange}
            />
            
            <h2>Language:</h2>
            <select
                name="trelloData.targetLanguage"
                value={modalData.trelloData.targetLanguage} 
                className={selectStyles}
                onChange={handleChange}
            >
                {supportedLanguageEnum.map((language) => {
                    const code = ISO6391.getCode(language) || language;
                    return (
                        <option key={language} value={code}>{language}</option>
                    )
                })}
            </select>

            <h2>Status:</h2>
            <select
                name="productStatus"
                value={modalData.productStatus} 
                className={selectStyles}
                onChange={handleChange}
            >
                {statusEnum.map((status) => {
                    return (
                        <option key={status} value={status}>{capitalize(status)}</option>
                    )
                })}
            </select>

            <h2>Due:</h2>
            <input
                name="trelloData.dueDate"
                value={modalData.trelloData.dueDate} // Storing pre-formatted value in state unfreezes input field
                className={inputStyles}
                onChange={handleChange}
            />

            <h2>Last Activity:</h2>
            <input
                name="trelloData.dateLastActivity"
                value={modalData.trelloData.dateLastActivity} // Storing pre-formatted value in state unfreezes input field
                className={inputStyles}
                onChange={handleChange}
            />

            <h2>Words:</h2>
            <input
                type="number"
                name="trelloData.wordCount"
                value={modalData.trelloData.wordCount}
                className={inputStyles}
                onChange={handleChange}
            />

            <h2>Translation Progress:</h2>
            <input
                type="number"
                name="crowdinData.translationProgress"
                value={modalData.crowdinData?.translationProgress ?? 0}
                className={inputStyles}
                onChange={handleChange} // Added missing change listener
            />

            <h2>Approval Progress:</h2>
            <input
                type="number"
                name="crowdinData.approvalProgress"
                value={modalData.crowdinData?.approvalProgress ?? 0}
                className={inputStyles}
                onChange={handleChange}
            />
        </div>
        <div className='flex flex-row p-4 justify-self-center gap-6'>
            <button className='bg-green-500 p-2 rounded-md cursor-pointer hover:bg-green-600 text-white font-bold transition-colors duration-200'>Save</button>
            <button 
                className='bg-red-500 p-2 rounded-md cursor-pointer hover:bg-red-700 text-white font-bold transition-colors duration-200'
                onClick={handleCancel}
            >Cancel
            </button>
        </div>
        </>
    )
}
