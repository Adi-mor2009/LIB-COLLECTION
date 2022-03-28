import React from 'react';
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import './InputBox.css'


function InputBox({ icon, placeholder, inputText, inputTextChange, onEnter, onClear }) {
    return (
        <div className="c-input-box">
            <Form.Group controlId="formInputBox">
                <InputGroup>
                    <InputGroup.Prepend>
                        <Button variant="outline-secondary" onClick={() => onClear()}><i className="bi bi-x-lg" style={{ color: 'red' }}></i></Button>
                    </InputGroup.Prepend>
                    {/* <Button variant="dark" onClick={() => onClear()}><i className="bi bi-x" style={{ color: 'red' }}></i></Button> */}
                    <Form.Control type="text" placeholder={placeholder}
                        value={inputText} onChange={e => inputTextChange(e.target.value)} onKeyPress={e => e.key === 'Enter' && e.target.value.length > 0 ? onEnter(e.target.value) : null}
                    />
                    {/* <button type="button" class="btn bg-transparent" style="margin-left: -40px; z-index: 100;">
                        <i class="bi bi-x"></i>
                    </button> */}
                    <InputGroup.Append>
                        <Button variant="outline-secondary" onClick={e => onEnter(e.target.value)}><i className="bi bi-filetype-xlsx" style={{ color: 'gray' }}></i></Button>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
        </div>
        //     <div class="input-group">
        //     <input type="text" class="form-control" placeholder="Search...">
        //     <button type="button" class="btn bg-transparent" style="margin-left: -40px; z-index: 100;">
        //       <i class="fa fa-times"></i>
        //     </button>
        // </div>

    );
}

export default InputBox;