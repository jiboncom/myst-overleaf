import { memo, useContext, useRef, useState, useEffect  } from 'react'

import { useIdeContext } from '@/shared/context/ide-context'
import { useOpenFile } from '@/features/ide-react/hooks/use-open-file'
import useScopeValue  from '../../shared/hooks/use-scope-value'
import MystPreview from './MystPreview.js';


function MystRender(props) {
  const ide = useIdeContext()
  //useOpenFile()
  
  // the Document currently open in the editor
  const [ currentDoc ] = useScopeValue('editor.sharejs_doc')

  const [value, setValue] = useState('')

  const startCompileKeypress = event => {
    console.log('tecla')
    if (currentDoc && currentDoc.getSnapshot) {
      console.log(currentDoc.getSnapshot())
      setValue(currentDoc.getSnapshot())
    }
    return true

    if (event.shiftKey || event.altKey) {
      return false
    }
  
    if (event.ctrlKey) {
      // Ctrl+s / Ctrl+Enter / Ctrl+.
      if (event.key === 's' || event.key === 'Enter' || event.key === '.') {
        if (currentDoc && currentDoc.getSnapshot) {
          console.log(currentDoc.getSnapshot())
          setValue(currentDoc.getSnapshot())
        }
        return true
      }
  
      // Ctrl+s with Caps-Lock on
      if (event.key === 'S' && !event.shiftKey) {
        return true
      }
    } else if (event.metaKey) {
      // Cmd+s / Cmd+Enter
      if (event.key === 's' || event.key === 'Enter') {
        return true
      }
  
      // Cmd+s with Caps-Lock on
      if (event.key === 'S' && !event.shiftKey) {
        return true
      }
    }
  }

  
  useEffect(() => {
    document.body.addEventListener('keydown', startCompileKeypress)
    return () => {
      document.body.removeEventListener('keydown', startCompileKeypress)
    }
  }, [startCompileKeypress])

  useEffect(() => {
    // Check currentDoc is not null and has getSnapshot() method
    if (currentDoc && currentDoc.getSnapshot) {
      console.log(currentDoc.getSnapshot())
      setValue(currentDoc.getSnapshot())
    }
  }, [currentDoc])

  //state = useCodeMirrorStateContext ()
  //useCodeMirrorScope(view)
  return (
    <div>
      <MystPreview value={value} />
    </div>
  )
}

export default memo(MystRender);