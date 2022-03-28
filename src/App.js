import './App.css';
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import InputBox from "./components/InputBox/InputBox";
import { useEffect, useState } from 'react';
import ApiDataService from './utils/ApiDataService';
import BibModel from './model/BibModel';
import ProgressComponent from './components/ProgressComponent/ProgressComponent'
import BibCard from "./components/BibCard/BibCard"
import HTMLtoDOCX from 'html-to-docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
//import { marc } from "marc4js"; 


function App() {
  const [loading, setLoading] = useState(false);
  const [searchCollectionText, setSearchCollectionText] = useState("");
  const [bibs, setBibs] = useState([]);
  const [globalError, setGlobalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalBibNumberInCollection, setTotalBibNumberInCollection] = useState(0);
  const [percentProgress, setPercentProgress] = useState(0);
  const MAX_PAGE_SIZE = 100;//0-100
  const TAG = "098";

  //const bibCards = bibs !== undefined ? bibs.map((bib, index) => <BibCard key={index.toString()} bib={bib} index={index}></BibCard>) : [];

  useEffect(() => {
    if (bibs.length > 0 && bibs.length == totalBibNumberInCollection) {
      downloadDocx();
    }
  }, [bibs])

  function clear() {
    console.log("clear pressed!!!");
    setTotalBibNumberInCollection(0);
    setSearchCollectionText("");
    setBibs([]);
    setErrorMessage("");
    setGlobalError(false);
  }

  function flipBracketsDirection(str) {
    function flip(c) {
      switch (c) {
        case '(': return ')';
        case ')': return '(';
        case '[': return ']';
        case ']': return '[';
        case '{': return '}';
        case '}': return '{';
        default: return c;
      }
    }
    return Array.from(str).map(c => flip(c)).join('');
  }
  //{book.mmsid && <Card.Link href={"https://haifa-primo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains," + book.mmsid + "&tab=haifa_all&vid=HAU&lang=iw_IL"} target="_blank"><Card.Text>הספר בקטלוג אוניברסיטת חיפה </Card.Text></Card.Link>}
  //<a href="url">link text</a>

  function sortBibs() {
    bibs.sort(function (a, b) {
      debugger
      const nameA = a.callNumber.toUpperCase(); // ignore upper and lowercase
      const nameB = b.callNumber.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  }
  function getHtmlString() {
    let htmlStrStart = `html dir="rtl" lang="he-IL" class="no-js no-svg">
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
        <table id="tbl_exporttable_to_xls">
            <th>MMS ID</th>
            <th>כותר</th>
            <th>מספר מיון</th>
            <th>קישור</th>
            <th>כותר מתוקן</th>
            <th>הערות</th>
            <tbody>`
    for (let i = 0; i < bibs.length; i++) {
      htmlStrStart += '<tr><td>' + bibs[i].mmsid + '</td><td>' + bibs[i].title + '</td><td>' + bibs[i].callNumber + '</td><td>' + '<a href=' + bibs[i].repUrl + '>' + bibs[i].repId + '</a>' + '</td><td>' + "" + '</td><td>' + "" + '</td></tr>'
      // htmlStrStart += '<tr><td>' + bibs[i].mmsid + '</td><td>' + bibs[i].title + '</td><td>' + bibs[i].callNumber + '</td><td>' + '<a href=' + "https://haifa-primo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains," + bibs[i].repId + "&tab=haifa_all&vid=HAU&lang=iw_IL target=_blank" + '>' + bibs[i].mmsid + '</a>' + '</td><td>' + "" + '</td><td>' + "" + '</td></tr>'
      // htmlStrStart += '<tr><td>' + bibs[i].mmsid + '</td><td>' + flipBracketsDirection(bibs[i].title) + '</td><td>' + bibs[i].callNumber + '</td></tr>'
    }
    //const tableContent = bibs.map((bib, index) => <tr dangerouslySetInnerHTML={{__html: '<strong>strong text</strong>'}}><td>{bib.mmsid}</td><td>{bib.title}</td><td>{bib.callNumber}</td></tr>);
    htmlStrStart +=
      `</tbody>
            </table>
        </body>
    </html>`
    debugger
    return htmlStrStart;
  }

  let table = `
      <table id="tbl_exporttable_to_xls>
          <th>MMS ID</th>
          <th>Title</th>
          <th>Call Number </th>
          <tbody>`
  for (let i = 0; i < bibs.length; i++) {
    table += '<tr><td>' + bibs[i].mmsid + '</td><td>' + bibs[i].title + '</td><td>' + bibs[i].callNumber + '</td></tr>'
    //table += '<tr><td>' + bibs[i].mmsid + '</td><td>' + flipBracketsDirection(bibs[i].title) + '</td><td>' + bibs[i].callNumber + '</td></tr>'
  }
  //const tableContent = bibs.map((bib, index) => <tr dangerouslySetInnerHTML={{__html: '<strong>strong text</strong>'}}><td>{bib.mmsid}</td><td>{bib.title}</td><td>{bib.callNumber}</td></tr>);
  table +=
    `</tbody>
          </table>`

  function ExportToExcel(type, fn, dl) {
    console.log("This should happen only once!!!");
    sortBibs();
    var doc = new DOMParser().parseFromString(getHtmlString(), "text/html");
    var elt = doc.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1", raw: true });
    setPercentProgress(100);
    return dl ?
      XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
      XLSX.writeFile(wb, fn || (searchCollectionText + '.' + (type || 'xlsx')));
  }

  async function downloadDocx(params) {
    console.log("downloadDocx");
    console.log(getHtmlString());
    //await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString)
    // const fileBuffer = await HTMLtoDOCX(getHtmlString(), null, {
    //   table: { row: { cantSplit: true } },
    //   orientation: "landscape",
    //   title: "Adi's test",
    //   footer: true,
    //   pageNumber: true,
    // });

    ExportToExcel('xlsx');

    // saveAs(fileBuffer, 'html-to-docx.docx');
  }

  // async function fromHtmlToWordDoc() {
  //   console.log("fromHtmlToWordDoc");
  //   await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString)
  //}

  function getCallNumberField(data) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(data, "text/xml");
    let callNumber;
    const fields = xmlDoc.getElementsByTagName("datafield");
    for (let i = 0; i < fields.length; i++) {
      if (TAG == fields[i].getAttribute('tag')) {
        callNumber = fields[i].childNodes[0] ? fields[i].childNodes[0].innerHTML : undefined;
        break;
      }
    }
    return callNumber;
  }

  async function handleInputEnter(pageNum) {
    console.log("!!!!handleInputEnter");
    setBibs([]);
    setTotalBibNumberInCollection(0);


    setLoading(true);
    const response = await ApiDataService.getDataById(ApiDataService.types.COLLECTIONS, searchCollectionText, 0, MAX_PAGE_SIZE);
    setLoading(false);
    if (response.error) {
      setGlobalError(true);
      setErrorMessage(response.error);
    }
    else {
      if (response.response) {
        setPercentProgress(10);
        const data = response.response.data.bib;
        let bibDataTotalResults = [];
        //setBibs(data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title)));
        //setBibs(bibs => bibs.concat(data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title))));
        //const bibsDataResult = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
        const dataArr = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
        bibDataTotalResults = [...bibDataTotalResults, ...dataArr];
        setTotalBibNumberInCollection(response.response.data.total_record_count);
        if (response.response.data.bib.length < response.response.data.total_record_count) {
          let index = response.response.data.total_record_count % 100 == 0 ? parseInt(response.response.data.total_record_count / 100) : parseInt(response.response.data.total_record_count / 100) + 1;
          console.log("index is " + index);
          const functions = [];
          for (let i = 1; i < index; ++i) {
            functions.push(i * 100);
          }
          // const promise1 = Promise.resolve(3);
          // const promise2 = 42;
          // const promise3 = new Promise(function (resolve, reject) {
          //   setTimeout(resolve, 100, 'foo');
          // });

          // Promise.all([promise1, promise2, promise3]).then(function (values) {
          //   console.log(values);
          // });
          // expected output: Array [3, 42, "foo"]
          // let promise = new Promise(function(resolve, reject) {
          //   resolve("done");

          //   reject(new Error("…")); // ignored
          //   setTimeout(() => resolve("…")); // ignored
          // });
          // const promises = [];
          // for (let i = 0; i < index; ++i) {
          //   const promise = new Promise(function (resolve, reject) {
          //     setLoading(true);
          //     const response = ApiDataService.getDataById(ApiDataService.types.COLLECTIONS, searchCollectionText, i, MAX_PAGE_SIZE);
          //     debugger
          //     setLoading(false);
          //     if (response.error) {
          //       setGlobalError(true);
          //       reject(response.error);
          //     }
          //     else {
          //       if (response.response) {
          //         debugger
          //         const data = response.response.data.bib;
          //         const bibsDataResult = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
          //         debugger
          //         resolve(bibsDataResult);
          //       };
          //     }
          //   })
          //   promises.push(promise);
          // }
          // Promise.all(promises).then(values => {
          //   debugger
          //   console.log("The valus are: " + values);
          //   bibDataTotalResults = values;
          // });
          setLoading(true);
          await Promise.all(
            functions.map(async (index) => {
              const bibsResponse = await ApiDataService.getDataById(ApiDataService.types.COLLECTIONS, searchCollectionText, index, MAX_PAGE_SIZE)
              if (bibsResponse.error) {
                setGlobalError(true);
                setErrorMessage(bibsResponse.error);
              }
              else {
                if (bibsResponse.response) {
                  const data = bibsResponse.response.data.bib;
                  const dataArr = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
                  bibDataTotalResults = [...bibDataTotalResults, ...dataArr];
                  setPercentProgress(30);
                  setLoading(false);
                }
              }
            })
          )
        }

        setLoading(true);
        await Promise.all(
          bibDataTotalResults.map(async (bib) => {
            const bibResponse = await ApiDataService.getDataById(ApiDataService.types.NONE, bib.mmsid);
            if (bibResponse.error) {
              setGlobalError(true);
              setErrorMessage(bibResponse.error);
            }
            else {
              if (bibResponse.response) {
                const bibMarcXmlData = bibResponse.response.data.anies[0];
                let callNumber = getCallNumberField(bibMarcXmlData);
                bib.setCallNumber(callNumber.replace(/ /g, ''));
                setPercentProgress(60);
              }
            }
          })
        )
        await Promise.all(
          bibDataTotalResults.map(async (bib) => {
            const repResponse = await ApiDataService.getDataById(ApiDataService.types.REPRESENTATIONS, bib.mmsid);
            if (repResponse.error) {
              setGlobalError(true);
              setErrorMessage(repResponse.error);
            }
            else {
              if (repResponse.response) {
                if (repResponse.response.data.total_record_count > 0) {
                  const repId = repResponse.response.data.representation[0] ? repResponse.response.data.representation[0].id : undefined;
                  //const repId = repResponse.response.data.representation[0].thumbnail_url;
                  const repUrl = repResponse.response.data.representation[0].delivery_url;
                  if (!repId) {
                    console.log("undefine!!!!");
                  }
                  bib.setRepId(repId);
                  bib.setRepUrl(repUrl);
                }
                else {
                  bib.setRepId("אין תמונה");
                  bib.setRepUrl("");
                }
                setPercentProgress(90);
              }
            }
          })
        )
        setBibs(bibDataTotalResults);
        setLoading(false);
        // setLoading(true);
        // //if (bibs.length == response.response.data.total_record_count) {
        // bibsDataResult.forEach(bib => {
        //   const bibResponse = ApiDataService.getDataById(ApiDataService.types.NONE, bib.mmsid);
        //   if (bibResponse.error) {
        //     setGlobalError(true);
        //   }
        //   else {
        //     if (bibResponse.response) {
        //       debugger
        //       const bibMarcXmlData = bibResponse.response.data.anies;
        //       getCallNumberField(bibMarcXmlData);
        //     }
        //   }
        // });
        // await Promise.all();
        // setLoading(false);
        // //}

        //setBibs(data.map((plainBib) => new BibModel(plainBib)));
        //setTotalPages(0);
      }
    }
  }

  return (
    <div className="App">
      <Container>
        <div>
          {globalError && <Alert variant="danger">
            {/* <Alert.Heading>Oh snap! You got an error!</Alert.Heading> */}
            אירעה שגיאה
            {/* <p>
              הודעת שגיאה:
              errorMessage
            </p> */}
          </Alert>}
        </div>
        <div style={{ margin: "20px" }}>
          <h2>רשומות ביבליוגרפיות לפי מספר אוסף</h2>
          <h4>:(collectionID יש להזין) הורדת קובץ אקסל של רשומות ביבליוגרפיות וקישורים לאובייקטים הדיגיטליים שבהן, על פי מספר אוסף בעלמא</h4>
        </div>
        <InputBox
          icon={<i className="bi bi-collection-fill"></i>}
          placeholder="כאן יש להכניס מספר סט לחיפוש ..."
          onEnter={handleInputEnter}
          inputText={searchCollectionText}
          inputTextChange={(text) => setSearchCollectionText(text)}
          onClear={clear}
        />
        <div className="p-bib-cards">
          {loading && <div className="p-subject-spinner"><Spinner animation="border" variant="primary" /></div>}
          {/* {loading && <ProgressComponent
            percentProgress={percentProgress}
            success={false} 
            warning={false} 
            error={false}
          />} */}
        </div>
        {/* <Button variant="link" onClick={() => downloadDocx()}><i className="bi bi-plus-circle-fill" style={{ color: 'lightskyblue' }}></i>  לחיצה להמרה  </Button> */}
      </Container>
    </div>
  );
}

export default App;
