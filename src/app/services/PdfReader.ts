import 'pdfjs-dist';
import {Observable} from "rxjs/Rx";

export class PdfReader {
    public read(data: string | Uint8Array): Observable<any> {
        PDFJS.workerSrc = require("file-loader!pdfjs-dist/build/pdf.worker.min.js");

        return Observable.fromPromise(PDFJS.getDocument(data).then(pdf => {
            let pages = [];
            for (let i = 0; i < pdf.numPages; i++) {
                pages.push(i);
            }

            return Promise.all(pages.map(pageNumber => {

                return pdf.getPage(pageNumber + 1).then(page => {

                    return page.getTextContent().then(textContent => {

                        return textContent.items.map(item => {
                            return item.str.trim().split(' ');
                        }).reduce((a, b) => {
                            return a.concat(b);
                        })

                    });
                });
            })).then(pages => pages);
        }));
    }
}