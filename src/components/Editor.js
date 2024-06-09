import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea( //Making an editor area
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {//Event listener provided by CodeMirror package to loisten to any change in the code
                const { origin } = changes; //Origin stores the event which triggered the change in the textarea
                const code = instance.getValue(); //Same as editorRef.current.getValue(). It returns the code inside the text editor
                onCodeChange(code);//Calling the onCodeChange() function received in parameters to set the value of codeRef.current
                if (origin !== 'setValue') { //If change is not caused by setValue function. setValue is only triggered when I joins the room.
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, { //When I changed the code I have set the new value of my codeRef.current but I have to emit it so that others can also set it. Emit event when I change the code
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => { //Triggered when I joins a new room and other person sends me code sync event
                if (code !== null) {
                    editorRef.current.setValue(code);//Setting new value of code
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;