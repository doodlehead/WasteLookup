import React from "react";
import Cookie from 'js-cookie';
//import Cookie from '../js.cookie.js';
//import PropTypes from "prop-types";
//import ReactDOM from 'react-dom';

class Lookup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      filtered: [],
      favorites: []
    };
    console.log(React.version);
  }

  componentDidMount() {
    //Fetch the waste lookup data with a GET request
    fetch('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000')
    .then(function(response) {
      return response.json();
    })
    .then( (myJson) => {
      this.setState({
        isLoaded: true,
        items: myJson
      });

      console.log(myJson);

      Cookie.remove('favorites');

      let str = JSON.stringify(myJson).substring(0,500);
      Cookie.set('favorites', str);

      let x = Cookie.get('favorites');
      //myJson is an array of JSON objects

      // for (let i = 0; i < myJson.length; i++) {
      //   let entry = myJson[i];

      //   console.log(entry.body);
      // }
      
    });
    
  }

  searchList = (word) => {
    let found = [];
    for (let i = 0; i < this.state.items.length; i++) {
        let entry = this.state.items[i];
        if(entry.keywords.includes(word)) {
          found.push(entry);
        }
    }
    return found;
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      let searchTerm = document.getElementById("search").value;
      this.setState((state) => ({
        filtered: this.searchList(searchTerm)
      }), () => {
        console.log(this.state.filtered);
      });
    }
    
  }

  render() {
    return (
      <React.Fragment>
        <p>This is the lookup component</p>
        <input id="search" type="text" className="input" placeholder="Search..." onKeyPress={this.handleKeyPress} />

        <h1>Search results here</h1>
        <RenderTableRows contents={this.state.filtered}/>

        <h1>Favorites</h1>
        <div>Fav results here</div>
      </React.Fragment>
    );
  }
}

function RenderTableRows(props) {
  let tableRows = [];
  for (let i = 0; i < props.contents.length; i++) {
    tableRows.push(<RenderSingleRow entry={props.contents[i]}/>);
  }
  return (
    <table class="table table-borderless">
      <tbody>
        {tableRows}
      </tbody>
    </table>
  )
}

function RenderSingleRow(props) {
  let parser = new DOMParser();
  let lookupData = parser.parseFromString(props.entry.body, "text/html");

  return ( 
    <tr>
      <td>{props.entry.title}</td>
      <td dangerouslySetInnerHTML={{__html: lookupData.documentElement.innerText}} />
      {/* <td>{<ParseHTML text={props.entry.body}/>}</td> */}
    </tr>
  );
}

function ParseHTML(props) {
  //Convert the html body into an actual element
  let parser = new DOMParser();
  let lookupData = parser.parseFromString(props.text, "text/html");

  // let t = document.createElement('template');
  // t.innerHTML = lookupData.documentElement.innerText;
  // return t.content.cloneNode(true);
  return lookupData.documentElement.innerText;

}

export default Lookup
