import ISO6391 from 'iso-639-1'
import { LangOpsProduct } from "@/app/lib/types";
import { capitalize, dateTimeFormat } from '@/app/lib/functions';
import CopyButton from '@/app/ui/components/copy-button'
import Link from 'next/link';
import clsx from 'clsx';


interface ModalDetailsProps {
  product: LangOpsProduct
}

export async function ViewOnlyModal({ product }: ModalDetailsProps) {
  const inputStyles = "field-sizing-content rounded-md bg-sky-500/50 p-2"
  return (
    <>
      <span className="block text-center font-bold text-white text-xl p-4">
        Product Details
      </span>
      <p className='block text-center text-grey bg-blue-900/70 rounded-md p-2 m-6 w-1/3 justify-self-center'>{`This product has status "${product.productStatus}" and cannot be edited here. ` }
      
        {
          product.productStatus !== 'deleted' ?
          <Link 
            className='text-orange-400 underline'          
            href={product.trelloData.url} 
            rel='noopener noreferrer' 
            target='_blank'
          > 
          Please edit on Trello.
        </Link>
        : null
        }
      </p>
      {
        product.productStatus === 'deleted' ?
        <div className='flex flex-row gap-6 justify-content-center justify-self-center'>
          <button className='bg-red-600 p-2 rounded-md cursor-pointer hover:bg-red-700'>Delete Permanently</button>
          <button className='bg-green-600 p-2 rounded-md cursor-pointer hover:bg-green-700'>Restore</button>
        </div>
        : null
      }
      <div className="flex flex-row justify-self-center gap-6 m-6">
        {
          product.trelloData.articleUrl ? 
          <CopyButton buttonText='Copy article URL' textToCopy={product.trelloData.articleUrl} /> :
          null
        }
        {
          product.trelloData.editorUrl ? 
          <CopyButton buttonText='Copy editor URL' textToCopy={product.trelloData.editorUrl} /> :
          null
        }
        {
          product.crowdinData?.crowdinUrl ? 
          <CopyButton buttonText='Copy Crowdin URL' textToCopy={product.crowdinData.crowdinUrl} /> :
          null
        }
        {
          product.youtubeData?.youTubeUrl ?
          <CopyButton buttonText='Copy YouTube URL' textToCopy={product.youtubeData?.youTubeUrl} /> :
          null
        }
        <CopyButton buttonText='Copy Trello URL' textToCopy={product.trelloData.url} />
      </div>
          
      <div className="text-white grid grid-cols-[0.2fr_1fr] p-4 gap-4 items-center text-right">
        <h2>Title:</h2>
        <input 
            disabled={true} 
            defaultValue={product.trelloData.title}
            className={inputStyles}
        >
        </input>
        <h2>Localized Title:</h2>
        <input 
            disabled={true} 
            defaultValue={product.trelloData.localizedTitle}
            className={inputStyles}
        >
        </input>
        <h2>Language:</h2>
        <input
          disabled={true}
          defaultValue={ISO6391.getName(product.trelloData.targetLanguage)}
          className={inputStyles}
        >
        </input>
        <h2>Status:</h2>
        <input
          disabled={true}
          defaultValue={capitalize(product.productStatus)}
          className={inputStyles}
        >
        </input>
        <h2>Due:</h2>
        <input
          disabled={true}
          defaultValue={dateTimeFormat(product.trelloData.dueDate)}
          className={inputStyles}
        >
        </input>
        <h2>Last Activity:</h2>
        <input
          disabled={true}
          defaultValue={dateTimeFormat(product.trelloData.dateLastActivity)}
          className={inputStyles}
        >
        </input>
        <h2>Words:</h2>
        <input
          disabled={true}
          defaultValue={product.trelloData.wordCount}
          className={inputStyles}
        >
        </input>
        <h2>Translation Progress:</h2>
        <input
          disabled={true}
          defaultValue={product.crowdinData.translationProgress?? 0}
          className={inputStyles}
        >
        </input>
        <h2>Approval Progress:</h2>
        <input
          disabled={true}
          defaultValue={product.crowdinData.approvalProgress ?? 0}
          className={inputStyles}
        >
        </input>
      </div>
    </>
  
  )
 
}