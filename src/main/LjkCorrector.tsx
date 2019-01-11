import * as React from "react";
import * as ReactDOM from "react-dom";
import config from "./config";
import FileItem from "./FileItem";
import "./style.css";

interface LjkCorrectorState {
  pendingFile: number,
  result: any,
  activeFile: number,
  encodedActiveImage: string
}

class LjkCorrector extends React.Component<{}, LjkCorrectorState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      activeFile: -1,
      pendingFile: 0,
      result: [],
      encodedActiveImage: ""
    }
  }

  render(): React.ReactNode {
    let items = this.generateFileItems(this.state.result);
    return (
        <React.Fragment>
          <div className="navbar">

          </div>
          <div className="content">
            <div className="sidebar">
              <input type="text" placeholder="Pencarian nama, nomor peserta" className="full basic-text-input"/>
              {this.state.pendingFile === 0 && (
                  <input type="file" onChange={(e) => this.handleChange(e.target.files)} multiple/>
              )}
              {this.state.pendingFile > 0 && (
                  <div className='waiting'>
                    <p> Masih memroses {this.state.pendingFile} gambar ... </p>
                  </div>
              )}
              <div className="items-container" id="items-container">
                {items}
              </div>
              {this.state.result.length > 0 && (
                  <div className="download-prompt" onClick={this.handleSaveAsCsv}>
                    Unduh sebagai CSV
                  </div>
              )}
            </div>
            <div className="preview">
              {this.state.activeFile >= 0 && (
                  <img src={"data:image/png;base64," + this.state.encodedActiveImage} alt="Result Preview" className="preview-image"/>
              )}
              {this.state.activeFile === -1 && (
                  <div className="center">
                    Upload dan pilih file untuk melihat preview
                  </div>
              )}
            </div>
          </div>
        </React.Fragment>
    );
  };

  getCsv = results => {
    let csv = "";
    csv += "no peserta,nama";
    for (let i = 1; i <= 120; i++) {
      csv += "," + i;
    }
    csv += "\n";
    results.forEach(result => {
      let arrAnswer = result.result.answer.replace(/_/g, " ").split("");
      csv += result.result.number + "," + result.result.name;
      arrAnswer.forEach(answer => {
        csv += "," + answer;
      });
      csv += "\n";
    });
    return csv;
  };

  downloadCsv = (csv, filename) => {
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    let data = encodeURI(csv);

    let link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  };

  handleSaveAsCsv = e => {
    let csv = this.getCsv(this.state.result);
    this.downloadCsv(csv, "jawaban.csv");
  };

  generateFileItems = (items) => {
    let fileItems = [];
    items.forEach((item, idx) => {
      console.log(this.state.activeFile);
      fileItems.push(
          <FileItem key={idx} id={idx.toString()} active={this.state.activeFile === idx}
                    onClick={this.handleFileItemClick}>
            <React.Fragment>
              <div>{item.result.number}</div>
              <div>{item.result.name}</div>
            </React.Fragment>
          </FileItem>
      )
    });
    return fileItems;
  };

  handleFileItemClick = (e) => {
    let id = parseInt(e.currentTarget.getAttribute("id"));
    this.setState((state, _) => ({
      ...state,
      activeFile: id,
      encodedActiveImage: this.state.result[id].result.encoded
    }))
  };

  sendImage = (img) => {
    let data = new FormData();
    data.append("file", img);
    fetch(config.serverUrl + '/result', {method: 'POST', body: data})
        .then(res => res.json())
        .then(data => this.updateResult(img.name, data))
        .catch(err => {
          console.log(err);
          this.setState((state, _) => ({
            ...state,
            pendingFile: state.pendingFile - 1
          }));
        });
  };

  updateResult = (filename, data) => {
    this.setState(state => ({
      ...state,
      pendingFile: this.state.pendingFile - 1,
      result: [
        ...state.result,
        {
          filename: filename,
          result: this.cleanResult(data)
        }
      ]
    }));
  };

  cleanResult = (data) => {
    data.number = data.number.replace(/_/g, " ");
    data.name = data.name.replace(/_/g, " ");
    data.answer = data.answer.replace(/_/g, " ");
    console.log(data);
    return data;
  };

  handleChange = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      let file = files.item(i);
      this.setState(state => ({
        ...state,
        pendingFile: state.pendingFile + 1
      }));
      this.sendImage(file);
    }
  };
}

const container = document.getElementById("root");
ReactDOM.render(<LjkCorrector/>, container);