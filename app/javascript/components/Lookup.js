import React from "react";
import Cookie from 'js-cookie';

class Lookup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      filtered: [],
      favoritesIds: [],
      favoriteItems: []
    };
    console.log(React.version);
  }

  componentDidMount() {
    //Get favorites from a cookie if it exists
    let favs = Cookie.get('favorites');
    //No cookies
    if(favs === undefined) {
      Cookie.set('favorites', '[]');
      favs = Cookie.get('favorites');
    }
    let cookieFavs = JSON.parse(favs);
    //Fetch the waste lookup data with a GET request

    fetch('https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000')
    .then(function(response) {
      return response.json();
    })
    .then( (myJson) => {
      for (let i = 0; i < myJson.length; i++) {
        //Add unique ids
        myJson[i].identifier = i;
      }
      //Get the actual item associated with the id
      let favItems = [];
      for (let i = 0; i < cookieFavs.length; i++) {
        favItems.push(myJson[cookieFavs[i]]);
      }

      this.setState({
        isLoaded: true,
        items: myJson,
        favoritesIds: cookieFavs,
        favoriteItems: favItems
      });

      console.log(myJson);

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

  doSearch = () => {
    let searchTerm = document.getElementById("search").value;
    this.setState((state) => ({
      filtered: this.searchList(searchTerm)
    }), () => {
      console.log(this.state.filtered);
    });
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.doSearch();
    }
  }

  toggleFavorite = (identifier) => {
    //Update cookie
    let favs = JSON.parse(Cookie.get('favorites'));
    if(favs.includes(identifier)) {
      console.log("remove from cookie");
      //Remove it from cookie
      favs.splice(favs.indexOf(identifier), 1);
      Cookie.set('favorites', JSON.stringify(favs));
    }
    else {
      //Add identifier to cookie
      console.log("add to cookie");
      favs.push(identifier);
      Cookie.set('favorites', JSON.stringify(favs));
    }

    //Update favorites list
    let ids = JSON.parse(Cookie.get('favorites'));
    let favItems = [];
    for (let i = 0; i < ids.length; i++) {
      favItems.push(this.state.items[ids[i]]);
    }

    this.setState((state) => {
      return {
        favoritesIds: ids,
        favoriteItems: favItems
      }
    });
  }

  render() {
    console.log("render");
    return (
      <React.Fragment>
        <input id="search" type="text" className="input" placeholder="Search..." onKeyPress={this.handleKeyPress} />
        <button id="searchButton"><i class="fas fa-search" id="searchIcon" onClick={this.doSearch}></i></button>

        <RenderTableRows contents={this.state.filtered} favToggle={this.toggleFavorite} 
        favoriteIds={this.state.favoritesIds}/>

        <h2>Favorites</h2>
        <RenderTableRows contents={this.state.favoriteItems} favToggle={this.toggleFavorite}
        favoriteIds={this.state.favoritesIds}/>
        
      </React.Fragment>
    );
  }
  
}

function RenderTableRows(props) {
  let tableRows = [];
  for (let i = 0; i < props.contents.length; i++) {
    tableRows.push(<RenderSingleRow entry={props.contents[i]} favToggle={props.favToggle}
      favoriteIds={props.favoriteIds}/>);
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
      <td ><i class="fas fa-star" onClick={() => {toggleFavorite(props.entry.identifier, props.favToggle)}} fav={props.favoriteIds.includes(props.entry.identifier) == true ? "true" : undefined}></i></td>
      <td>{props.entry.title}</td>
      <td dangerouslySetInnerHTML={{__html: lookupData.documentElement.innerText}} />
    </tr>
  );
}

function toggleFavorite(identifier, toggleFunc) {
  console.log("toggle " + identifier );
  toggleFunc(identifier);
}

export default Lookup
