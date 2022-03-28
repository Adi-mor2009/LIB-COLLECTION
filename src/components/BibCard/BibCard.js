import { Card } from "react-bootstrap";
import './BibCard.css';

function BibCard({ bib, index }) {
    //const divRef = React.useRef();
    // const handleClick = () => {
    //   console.log(divRef.current.outerHTML);
    //  };
    //  return (
    //      <div ref={divRef}>
    //        <button onClick={handleClick}>Get HTML</button>
    //        <p>Some text inside ...</p>
    //      </div>
    //  );
    debugger
    return (
        <div className="c-bib-card">
            <Card>
                <Card.Body>
                    <Card.Title>כותרת: {bib.title}</Card.Title>
                    <Card.Text>מספר מערכת: {bib.mmsid}</Card.Text>
                    <Card.Text>call number: {bib.callNumber}</Card.Text>
                    <Card.Text>מספר: {index}</Card.Text>
                </Card.Body>
            </Card>
        </div>
        // <html ref={divRef} dir="rtl" lang="he-IL" class="no-js no-svg">
        //     <head>
        //         <meta charset="UTF-8" />
        //     </head>
        //     <body>
        //         <table>
        //             <th>MMS ID</th>
        //             <th>Title</th>
        //             <th>Call Number </th>
        //             <tbody>
        //                 <tr><td>{bib.mmsid}</td><td>{bib.title}</td><td>{bib.callNumber}</td></tr>
        //             </tbody>
        //         </table>
        //     </body>
        // </html>
    )
}

export default BibCard;