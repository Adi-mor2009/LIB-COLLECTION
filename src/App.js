import './App.css';
import { Container, Spinner, Alert, Row } from "react-bootstrap";
import InputBox from "./components/InputBox/InputBox";
import { useEffect, useState } from 'react';
import ApiDataService from './utils/ApiDataService';
import BibModel from './model/BibModel';
// import ProgressComponent from './components/ProgressComponent/ProgressComponent'
// import BibCard from "./components/BibCard/BibCard"
// import HTMLtoDOCX from 'html-to-docx';
// import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
//import { marc } from "marc4js"; 


function App() {
  const [loading, setLoading] = useState(false);
  const [searchCollectionText, setSearchCollectionText] = useState("");
  const [bibs, setBibs] = useState([]);
  const [globalError, setGlobalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("אירעה שגיאה");
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);
  }
  //{book.mmsid && <Card.Link href={"https://haifa-primo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains," + book.mmsid + "&tab=haifa_all&vid=HAU&lang=iw_IL"} target="_blank"><Card.Text>הספר בקטלוג אוניברסיטת חיפה </Card.Text></Card.Link>}
  //<a href="url">link text</a>

  function sortBibs() {
    bibs.sort(function (a, b) {
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
            <th>כותר</th>
            <th>כותר מתוקן</th>
            <th>הערות</th>
            <th>קישור</th>
            <th>MMS ID</th>
            <th>מספר מיון</th>
            <tbody>`
    for (let i = 0; i < bibs.length; i++) {
      htmlStrStart += '<tr><td>' + bibs[i].title + '</td><td>' + "&nbsp;" + '</td><td>' + "&nbsp;" + '</td><td>' + '<a href=' + bibs[i].repUrl + '>' + bibs[i].repId + '</a>' + '</td><td>' + bibs[i].mmsid + '</td><td>' + bibs[i].callNumber + '</td></tr>'
      // htmlStrStart += '<tr><td>' + bibs[i].mmsid + '</td><td>' + bibs[i].title + '</td><td>' + bibs[i].callNumber + '</td><td>' + '<a href=' + "https://haifa-primo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains," + bibs[i].repId + "&tab=haifa_all&vid=HAU&lang=iw_IL target=_blank" + '>' + bibs[i].mmsid + '</a>' + '</td><td>' + "" + '</td><td>' + "" + '</td></tr>'
      // htmlStrStart += '<tr><td>' + bibs[i].mmsid + '</td><td>' + flipBracketsDirection(bibs[i].title) + '</td><td>' + bibs[i].callNumber + '</td></tr>'
    }
    htmlStrStart +=
      `</tbody>
            </table>
        </body>
    </html>`
    debugger
    return htmlStrStart;
  }

  function ExportToExcel(type, fn, dl) {
    console.log("This should happen only once!!!");
    sortBibs();
    var doc = new DOMParser().parseFromString(getHtmlString(), "text/html");
    var elt = doc.getElementById('tbl_exporttable_to_xls');
    var wb = XLSX.utils.table_to_book(elt, { Workbook: { Views: [{ RTL: true }] }, sheet: "sheet1", raw: true });
    if (wb.Workbook) { wb.Workbook.Views[0]['RTL'] = true; } else { wb.Workbook = {}; wb.Workbook['Views'] = [{ RTL: true }]; }
    //bibs.map(b => b.title)
    //Math.max(...(bibs.map(b => b.length)));
    //Math.max.apply(Math, bibs.map(function(b) { return b.title; })) + 2 
    //console.log("Title width: " + Math.max(...(bibs.map(b => b.title.length))));
    wb.Sheets['sheet1']['!cols'].push({ width: 100}, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: Math.max(...(bibs.map(b => b.callNumber.length))) })
    debugger
    setPercentProgress(100);
    return dl ?
      XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64'}) :
      XLSX.writeFile(wb, fn || (searchCollectionText + '.' + (type || 'xlsx')));
  }

  async function downloadDocx(params) {
    // console.log("downloadDocx");
    // console.log(getHtmlString());
    //await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString)
    // const fileBuffer = await HTMLtoDOCX(getHtmlString(), null, {
    //   table: { row: { cantSplit: true } },
    //   orientation: "landscape",
    //   title: "Adi's test",
    //   footer: true,
    //   pageNumber: true,
    // });

    ExportToExcel('xlsx');
    setSuccess(true);
    // saveAs(fileBuffer, 'html-to-docx.docx');
  }

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
    setBibs([]);
    setTotalBibNumberInCollection(0);
    setGlobalError(false);
    setSuccess(false);


    setLoading(true);
    const response = await ApiDataService.getDataById(ApiDataService.types.COLLECTIONS, searchCollectionText, 0, MAX_PAGE_SIZE);
    setLoading(false);
    if (response.error) {
      setGlobalError(true);
      //setErrorMessage(response.error);
    }
    else {
      if (response.response) {
        if (response.response.data.total_record_count > 0) {
          setPercentProgress(10);
          const data = response.response.data.bib;
          let bibDataTotalResults = [];
          //setBibs(data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title)));
          //setBibs(bibs => bibs.concat(data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title))));
          //const bibsDataResult = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
          const dataArr = data.map((bib_item) => new BibModel(bib_item.mms_id, bib_item.title));
          bibDataTotalResults = [...bibDataTotalResults, ...dataArr]; //Here it is the result of all bibs in the first page
          setTotalBibNumberInCollection(response.response.data.total_record_count);
          if (response.response.data.bib.length < response.response.data.total_record_count) {//If there are more pages
            let index = response.response.data.total_record_count % 100 == 0 ? parseInt(response.response.data.total_record_count / 100) : parseInt(response.response.data.total_record_count / 100) + 1;
            const functions = []; //Array of all the pages num
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
            //Here we call to get all the bibs from pages >= 100
            await Promise.all(
              functions.map(async (index) => {
                const bibsResponse = await ApiDataService.getDataById(ApiDataService.types.COLLECTIONS, searchCollectionText, index, MAX_PAGE_SIZE)
                if (bibsResponse.error) {
                  setGlobalError(true);
                  //setErrorMessage(bibsResponse.error);
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
          //Here we call to get data for every bib by its id
          await Promise.all(
            bibDataTotalResults.map(async (bib) => {
              const bibResponse = await ApiDataService.getDataById(ApiDataService.types.NONE, bib.mmsid);
              if (bibResponse.error) {
                setGlobalError(true);
                //setErrorMessage(bibResponse.error);
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
          //Here we call to get the representation of every bib by the id
          await Promise.all(
            bibDataTotalResults.map(async (bib) => {
              const repResponse = await ApiDataService.getDataById(ApiDataService.types.REPRESENTATIONS, bib.mmsid);
              if (repResponse.error) {
                setGlobalError(true);
                //setErrorMessage(repResponse.error);
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
        }
        else {
          setGlobalError(true);
          setErrorMessage("אין רשומות באוסף זה");
        }
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
      <Container fluid>
        <div>
          {globalError && <Alert variant="danger" onClose={() => setGlobalError(false)}>
            {errorMessage}
          </Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(false)}>
            הקובץ מוכן להורדה
          </Alert>}
        </div>
        <img src="https://haifa-primo.hosted.exlibrisgroup.com/primo-explore/custom/HAU/img/library-logo.png" alt="ספריית יונס וסוראיה נזריאן" />
        <div style={{ margin: "20px" }}>
          <h2>רשומות ביבליוגרפיות לפי מספר אוסף</h2>
        </div>
        <Row id="collection-sub-title">
          <h4>:(collectionID יש להזין) הורדת קובץ אקסל של רשומות ביבליוגרפיות וקישורים לאובייקטים הדיגיטליים שבהן, על פי מספר אוסף בעלמא</h4>
        </Row>
        <Row id="rowForInput">
          <InputBox
            icon={<i className="bi bi-collection-fill"></i>}
            placeholder="מספר אוסף (Collection ID)"
            onEnter={handleInputEnter}
            inputText={searchCollectionText}
            inputTextChange={(text) => setSearchCollectionText(text)}
            onClear={clear}
          />
        </Row>
        <div className="p-bib-cards">
          {loading && <div className="p-subject-spinner"><Spinner animation="border" variant="primary" /></div>}
          {/* {loading && <ProgressComponent
            percentProgress={percentProgress}
            success={false} 
            warning={false} 
            error={false}
          />} */}
        </div>
      </Container>
    </div>
  );
}

export default App;
