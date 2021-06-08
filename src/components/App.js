import React, { Component } from 'react';
import './App.css';
import * as XLSX from 'xlsx';
import { Table, Button } from 'react-bootstrap';
import image from './How_Does_Blockchain_work_Inlea_02.png'
import Meme from '../abis/Meme.json'

const { create } = require('ipfs-http-client')
const ipfs = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const Web3 = require('web3')

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData) {
      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi, address)
      this.setState({ contract })
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })
    }
    else {
      window.alert("Smart Contract no deployed!")
    }
  }
  
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer: null,
      contract: null,
      memeHash: '',
      items: []
    };
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Please use metamask')
    }
  }
  
  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        const wb = XLSX.read(bufferArray, {type: 'buffer'});
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        resolve(data);
      }
      fileReader.onerror = ((error) => {
        reject(error);
      })
    })
    promise.then((d) => {
      this.setState({ items: d })
    })
  }

  onSubmit = (event) => {
    event.preventDefault()
    console.log('Submitting the form...')
    const res = ipfs.add(this.state.buffer)
    res.then((result, error) => {
      console.log("IPFS Result", result)
      const arr = []
      for (const key in result) {
        arr.push(result[key])
      }
      const memeHash = arr[0]
      this.setState({ memeHash: memeHash})
      console.log(memeHash)
      if(error) {
        console.error(error)
        return
      }
      this.state.contract.methods.set(memeHash).send({ from: this.state.account }).then((r) => {
        this.setState({ memeHash })
      })
    })
  }
  // hash: QmQtejz4MsMciwqCtm51LhzaXpRPHfiX2W5bN8KjmeyVqk
  // url: https://ipfs.infura.io/ipfs/QmQtejz4MsMciwqCtm51LhzaXpRPHfiX2W5bN8KjmeyVqk
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
            Roaming Fraud Prevention
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <img src={ image } alt="this is blockchain image" />
                <h1>Upload Dataset</h1>
                <form id="space" onSubmit={this.onSubmit}>
                  <div>
                    <div id="spacing">
                      <input type="file" onChange={this.captureFile} id="demo-file" />
                      <Button variant="outline-success" as="input" type="submit" value="Upload" id="button" />
                      <a href={"https://ipfs.infura.io/ipfs/" + this.state.memeHash} >
                        <Button variant="outline-success" as="input" type="button" value="Download" id="fetch" />
                      </a>
                    </div>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th scope="col">Date & Time</th>
                          <th scope="col">Cell ID</th>
                          <th scope="col">Country Code</th>
                          <th scope="col">SMS In</th>
                          <th scope="col">SMS Out</th>
                          <th scope="col">Call In</th>
                          <th scope="col">Call Out</th>
                          <th scope="col">Internet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.items.map((d) => (
                          <tr key={d.datetime}>
                            <td>{d.datetime}</td>
                            <td>{d.CellID}</td>
                            <td>{d.countrycode}</td>
                            <td>{d.smsin}</td>
                            <td>{d.smsout}</td>
                            <td>{d.callin}</td>
                            <td>{d.callout}</td>
                            <td>{d.internet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
