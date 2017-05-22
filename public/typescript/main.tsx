import { Component, React, ReactDOM, bind, KeyValuePair } from 'chen-react';
import { Property } from './property';

export interface HomeProps {}

export interface HomeState {
  rentals?: any[];
  selectedRent?: any;
  count?: number;
  pageCount?: number;
  minRent?: number;
  maxRent?: number;
  bed?: string[];
  petsAllowed?: string[];
  bathRoom?: string[];
  instantViewing?: boolean;
  page?: number;
  moreFilter?: number;
  loading?: boolean;
}

declare var google;

export class Home extends Component<HomeProps, HomeState> {

  private mapDiv: HTMLDivElement;
  private markers: KeyValuePair<any> = {};
  private gMap;

  constructor(props: HomeProps, context) {
    super(props, context);

    this.state = {
      loading: true,
      rentals: [],
      minRent: parseInt(this.getParameterByName('minRent')) || null,
      maxRent: parseInt(this.getParameterByName('maxRent')) || null,
      page: parseInt(this.getParameterByName('page')) || 1,
      bed: this.getParameterByName('bed[]') || [],
      bathRoom: this.getParameterByName('bathRoom[]') || [],
      petsAllowed: this.getParameterByName('petsAllowed[]') || [],
      instantViewing: !!parseInt(this.getParameterByName('instantViewing')) || false,
      moreFilter: parseInt(this.getParameterByName('moreFilter')) || 0
    };

  }

  getParameterByName(key: string, target?: string) {
    let values = [];
    if(!target){
      target = decodeURIComponent(location.href);
    }

    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    let pattern = key + '=([^&#]+)';
    let o_reg = new RegExp(pattern,'ig');
    while (true){
      let matches = o_reg.exec(target);
      if (matches && matches[1]){
        values.push(matches[1]);
      } else {
        break;
      }
    }
    if (!values.length){
      return null;
    }

    return values.length == 1 && key.indexOf('[]') !== -1 ? values[0] : values;
  }

  getRentals() {
    this.setState({ loading: true });

    $.ajax({
      url: '/api/properties',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      },
      data: {
        maxRent: this.state.maxRent,
        minRent: this.state.minRent,
        bed: this.state.bed,
        bathRoom: this.state.bathRoom,
        petsAllowed: this.state.petsAllowed,
        instantViewing: this.state.instantViewing ? 1 : 0,
        page: this.state.page
      }
    }).done((res) => {
      if (res.data) {
        this.setState({ loading: false, rentals: res.data, count: res.count, pageCount: res.pageCount })
      }
    }).fail((err) => {
      this.setState({ loading: false })
    });
  }

  @bind()
  closeInfo() {
    this.setState({ selectedRent: null });
  }

  componentWillUpdate(props: HomeProps, state: HomeState) {
    if (this.state != state) {
      var search = location.search.substring(1);
      let queryStrings = {};
      try {
        queryStrings = search ? this.parseParams(search) : {};
      } catch (e) {}

      if (state.minRent != this.state.minRent) {
        delete queryStrings['minRent'];
        if (state.minRent) {
          queryStrings['minRent'] = state.minRent;
        }
      }

      if (state.maxRent != this.state.maxRent) {
        delete queryStrings['maxRent'];
        if (state.maxRent) {
          queryStrings['maxRent'] = state.maxRent;
        }
      }

      if (state.bed != this.state.bed) {
        queryStrings['bed'] = state.bed;
      }

      if (state.bathRoom != this.state.bathRoom) {
        queryStrings['bathRoom'] = state.bathRoom;
      }

      if (state.petsAllowed != this.state.petsAllowed) {
        queryStrings['petsAllowed'] = state.petsAllowed;
      }

      if (state.instantViewing != this.state.instantViewing) {
        delete queryStrings['instantViewing'];
        if (state.instantViewing) {
          queryStrings['instantViewing'] = state.instantViewing ? 1 : 0;
        }
      }

      if (state.moreFilter != this.state.moreFilter) {
        delete queryStrings['moreFilter'];
        if (state.moreFilter) {
          queryStrings['moreFilter'] = state.moreFilter;
        }
      }

      var newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${$.param(queryStrings)}`;
      window.history.pushState({ path:newurl }, '', newurl);
    }

  }

  parseParams(query: string): KeyValuePair<any> {
    let re = /([^&=]+)=?([^&]*)/g;
    let decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
    let decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
    let params = {}, e;
    while ( e = re.exec(query) ) {
      var k = decode( e[1] ), v = decode( e[2] );
      if (k.substring(k.length - 2) === '[]') {
        k = k.substring(0, k.length - 2);
        (params[k] || (params[k] = [])).push(v);
      }
      else params[k] = v;
    }
    return params;
  }

  componentDidMount() {
    this.gMap = new google.maps.Map(this.mapDiv, {
      zoom: 12,
      center: {lat: 37.7227707, lng: -122.424672}
    });

    this.getRentals();

  }

  componentDidUpdate(props: HomeProps, state: HomeState) {
    if (this.state.rentals && this.state.rentals.length && this.state.rentals != state.rentals) {

      let ids = [];
      this.state.rentals.map(rent => {
        ids.push(rent['_id']);
        if (this.markers[rent['_id']]) {
          this.markers[rent['_id']].setMap(null);
          this.markers[rent['_id']] = new google.maps.Marker({
            position: {
              lat: rent['location']['lat'],
              lng: rent['location']['long']
            },
            map: this.gMap,
            icon: {
              url: '/images/marker-icon.png',
              scaledSize: new google.maps.Size(23, 28),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(0, 0)
            }
           });
        } else {
          this.markers[rent['_id']] = new google.maps.Marker({
            position: {
              lat: rent['location']['lat'],
              lng: rent['location']['long']
            },
            map: this.gMap,
            icon: {
              url: '/images/marker-icon.png',
              scaledSize: new google.maps.Size(23, 28),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(0, 0)
            },
            zIndex: 1
          });
        }

        this.markers[rent['_id']].addListener('click', () => {
          this.setState({ selectedRent: rent });
        });
      });

      for (let key of Object.keys(this.markers)) {
        if (ids.indexOf(key) === -1) {
          this.markers[key].setMap(null);
          delete this.markers[key];
        }
      }
    }

    let markers = this.markers;
    $('.result-item').hover(
      function (event) {
        let id = this.id.replace('res-', '');
        if (markers[id]) {
          markers[id].setZIndex(2);
          markers[id].setIcon({
            url: '/images/hover-marker-icon.png',
            scaledSize: new google.maps.Size(28, 33),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 10)
          })
        }
      },
      function (event) {
        let id = this.id.replace('res-', '');
        if (markers[id]) {
          markers[id].setZIndex(1);
          markers[id].setIcon({
            url: '/images/marker-icon.png',
            scaledSize: new google.maps.Size(23, 28),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(0, 0)
          });
        }
      }
    )
  }


  getPagination() {
    let buttons = [];
    for (let x = 1; x <= this.state.pageCount; x++) {
      buttons.push(
        <li key={x} className={this.state.page == (x) ? 'active' : ''}>
          <a href="javascript:void(0)" onClick={e => this.setState({ page: x }, () => this.getRentals())}>{x}</a>
        </li>);
    }

    return (
      <div className="results-pag ">
        <ul>
          <li>
            <span>{this.state.count} Results</span>
          </li>
          {buttons}
        </ul>
      </div>
    );
  }

  @bind()
  selectMin(e) {
    this.setState({ minRent: e.target.value }, () => this.getRentals());
  }

  @bind()
  selectMax(e) {
    this.setState({ maxRent: e.target.value }, () => this.getRentals());
  }

  selectBed(val) {
    let bed = this.state.bed.concat();
    let index = bed.indexOf(val);
    if (index === -1) {
      bed.push(val);
    } else {
      bed.splice(index, 1);
    }

    this.setState({ bed }, () => this.getRentals());
  }

  selectBath(val) {
    let bathRoom = this.state.bathRoom.concat();
    let index = bathRoom.indexOf(val);
    if (index === -1) {
      bathRoom.push(val);
    } else {
      bathRoom.splice(index, 1);
    }

    this.setState({ bathRoom }, () => this.getRentals());
  }

  selectPet(val) {
    let petsAllowed = this.state.petsAllowed.concat();
    let index = petsAllowed.indexOf(val);

    if (index === -1) {
      petsAllowed.push(val);
    } else {
      petsAllowed.splice(index, 1);
    }

    this.setState({ petsAllowed }, () => this.getRentals());
  }

  toggleInstantViewing() {
    this.setState({ instantViewing: !this.state.instantViewing }, () => this.getRentals())
  }

  @bind()
  clearFilter() {
    this.setState({
        bed: [],
        petsAllowed: [],
        minRent: null,
        maxRent: null,
        page: 1,
        bathRoom: [],
        instantViewing: false
      },
      () => this.getRentals()
    );
  }

  @bind()
  moreFilter() {
    this.setState({ moreFilter: this.state.moreFilter ? 0 : 1 });
  }

  public render() {

    let maxOptions = [], minOptions = [];
    for(let x = 1000; x <= 10000; x+=500) {
      if (!this.state.minRent || this.state.minRent <= x) {
        maxOptions.push(<option key={x} value={`${x}`}>${x}</option>);
      }

      if (!this.state.maxRent || this.state.maxRent >= x) {
        minOptions.push(<option key={x} value={`${x}`}>${x}</option>);
      }
    }

    let beds = ['1', '2', '3', '4', '5+'];
    let bathRooms = ['1', '2', '3', '4+'];

    let rentLoc;
    if (this.state.selectedRent) {
      rentLoc = {
        lat: this.state.selectedRent['location']['lat'],
        lng: this.state.selectedRent['location']['long']
      };
    }

    let showClear = this.state.bed.length || this.state.bathRoom.length || this.state.maxRent
      || this.state.minRent || this.state.petsAllowed.length || this.state.instantViewing ? true : false;

    return (
      <div className="body">
        <div className="main-content">
          <div className="heading">
            <div className="col-md-12">
              <ol className="breadcrumb">
                <li><a href="#">Home</a></li>
                <li><a href="#">Rentals</a></li>
                <li className="active"><a href="#">San Francisco</a></li>
              </ol>
              <h1 className="text-center">San Francisco Bay Area Rental Property Listings</h1>
            </div>
          </div>
          <div className="filter row" >
            <div className="col-md-2 unpadded back-to-rentals">
              <h5> <img src="https://www.onerent.co/images/active-location-icon.png"/> <br/>BAY AREA</h5>
            </div>
            <div className="col-md-10 filter-form">
              <form>
                <div className="row">
                  <div className="col-md-1 filter-icon">
                    <img className="img-responsive" src="https://www.onerent.co/images/filter-icon.png"/>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="max-rent">Min Rent</label>
                      <select id="max-rent" className="form-control" value={`${this.state.minRent}`} onChange={this.selectMin}>
                        <option value={''}>Choose ...</option>
                        {minOptions}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="min-rent">Max Rent</label>
                      <select id="min-rent" className="form-control" value={`${this.state.maxRent}`} onChange={this.selectMax}>
                        <option value={''}>Choose ...</option>
                        {maxOptions}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Beds</label><br/>
                      <div className="page-no" >
                        {beds.map(val => {
                          let cls = 'btn btn-xs';
                          if (this.state.bed.indexOf(val) !== -1) {
                            cls = 'btn btn-xs active';
                          }
                          return (
                            <span key={val}>
                            <button type="button" onClick={e => this.selectBed(val)} className={cls}>{val}</button>&nbsp;
                          </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 more-items">
                    <div className="form-group button-actions">
                      {showClear ?
                        <button type="button" onClick={this.clearFilter} className="btn btn-warning">Clear</button>
                        : null}
                      <button type="button" onClick={this.moreFilter} className={`btn btn-{this.state.more ? 'normal' : 'danger'}`}> {this.state.moreFilter ? 'Close' : 'More'}</button>
                    </div>
                  </div>
                </div>
                {this.state.moreFilter ?
                  <div className="row">
                    <div className="col-md-offset-1 col-md-3">
                      <div className="form-group">
                        <label>Baths</label><br/>
                        <div className="page-no">
                          {bathRooms.map(val => {
                            let cls = 'btn btn-xs';
                            if (this.state.bathRoom.indexOf(val) !== -1) {
                              cls = 'btn btn-xs active';
                            }
                            return <span key={val}>
                          <button type="button" onClick={e => this.selectBath(val)} className={cls}>{val}</button>&nbsp;
                        </span>
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Pets Allowed</label><br/>
                        <div className="page-no">
                          <span>
                            <button type="button"
                                    onClick={e => this.selectPet('Cat')}
                                    className={`btn btn-xs ${this.state.petsAllowed.indexOf('Cat') !== -1 ? 'active' : ''}`}>
                              CATS
                            </button>
                          </span>
                          <span>
                            <button type="button"
                                    onClick={e => this.selectPet('Dog')}
                                    className={`btn btn-xs ${this.state.petsAllowed.indexOf('Dog') !== -1 ? 'active' : ''}`}>
                              DOGS
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Instant Viewing</label><br/>
                        <div className="page-no">
                          <input onClick={e => this.toggleInstantViewing()}
                                 defaultChecked={this.state.instantViewing}
                                 type="checkbox" />
                        </div>
                      </div>
                    </div>
                  </div>
                  : null}
              </form>
            </div>
          </div>
          <div className="results-figure">
            {this.getPagination()}
          </div>
          <div className="row clearfix results-section">
            {this.state.rentals.map(property => <Property key={property['_id']} details={property} />)}
          </div>
          <div className="results-figure fixed-bottom" >
            {this.getPagination()}
          </div>
        </div>
        <div className="map" data-spy="affix" data-offset-top="0">
          <div style={{ height: 'calc(100vh - 60px)' }} ref={e => this.mapDiv = e}></div>
          {this.state.selectedRent ?
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '95%' }}>
              <span className="pull-right" style={{ top: '25px', position: 'relative', right: '10px', color: '#fff' }} onClick={this.closeInfo}><i className="fa fa-times"></i></span>
              <img height="250px" src={`https://maps.googleapis.com/maps/api/streetview?location=${rentLoc['lat']},${rentLoc['lng']}&size=1280x720&fov=90&key=AIzaSyAp2FJJJNV6peSh8vHfXxb680UQZh7f33E`} width="100%" />
              <span style={{ top:'-41px',left: '10px',position: 'relative',color: '#fff'}}>
            {this.state.selectedRent['address']} {this.state.selectedRent['city']}<br/>
                {this.state.selectedRent['bedCount']} bed{this.state.selectedRent['bedCount'] > 1 ? 's' : ''}, &nbsp;
                {this.state.selectedRent['bathroomCount']} bath{this.state.selectedRent['bathroomCount'] > 1 ? 's' : ''},  &nbsp;
          </span>
            </div>
            : null}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Home />, document.getElementById('react-main'));
