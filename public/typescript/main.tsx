import { Component, React, ReactDOM, bind, KeyValuePair } from 'chen-react';

export interface HomeProps {}

export interface HomeState {
  rentals?: any[];
  selectedRent?: any;
  count?: number;
  pageCount?: number;
  minRent?: number;
  maxRent?: number;
  beds?: string;
  bath?: string;
  page?: number;
  more?: boolean;
  loading?: boolean;
}

declare var google;

export class Home extends Component<HomeProps, HomeState> {

  private mapDiv: HTMLDivElement;
  private markers: KeyValuePair<any> = {};
  private gMap;

  constructor(props: HomeProps, context) {
    super(props, context);

    this.state = { loading: true };
  }

  getRentals() {

    this.setState({ loading: true });

    $.ajax({
      url: '/rentals',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      },
      data: {
        max_rent: this.state.maxRent,
        min_rent: this.state.minRent,
        beds: this.state.beds,
        bath: this.state.bath,
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
        ids.push(rent['id']);
        if (this.markers[rent['id']]) {
          this.markers[rent['id']].setMap(null);
          this.markers[rent['id']] = new google.maps.Marker({
            position: JSON.parse(rent['geoLocation']),
            map: this.gMap,
            icon: '/assets/images/marker-icon.png'
          });
        } else {
          this.markers[rent['id']] = new google.maps.Marker({
            position: JSON.parse(rent['geoLocation']),
            map: this.gMap,
            icon: '/assets/images/marker-icon.png'
          });
        }

        this.markers[rent['id']].addListener('click', () => {
          this.setState({ selectedRent: rent });
        });
      });

      for (let key of Object.keys(this.markers)) {
        if (ids.indexOf(parseInt(key)) === -1) {
          this.markers[key].setMap(null);
          delete this.markers[key];
        }
      }
    }
  }


  getPagination() {
    let buttons = [];
    for (let x = 0; x < this.state.pageCount; x++) {
      buttons.push(<li key={x}>
        <a href="javascript:void(0)" onClick={e => this.setState({ page: x + 1 }, () => this.getRentals())}>{x + 1}</a>
      </li>);
    }

    return (
      <div className="row">
        <div className="pages">
          <h5>{this.state.count} results</h5>
          <ul className="pagination">{buttons}</ul>
        </div>
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
    this.setState({ beds: val }, () => this.getRentals());
  }

  selectBath(val) {
    this.setState({ bath: val }, () => this.getRentals());
  }

  @bind()
  clearFilter() {
    this.setState({ beds: null, minRent: null, maxRent: null, page: null, bath: null }, () => this.getRentals());
  }

  @bind()
  moreFilter() {
    this.setState({ more: !this.state.more });
  }

  public render() {

    let maxOptions = [], minOptions = [];
    for (let x = 0; x < 10; x++) {
      let val = (x+1) * 1000;

      if (!this.state.minRent || this.state.minRent < val) {
        maxOptions.push(<option key={val} value={`${val}`}>${val}</option>);
      }
      if (!this.state.minRent || this.state.minRent < (val + 500)) {
        maxOptions.push(<option key={val + 500} value={`${val + 500}`}>${val + 500}</option>);
      }

      if (!this.state.maxRent || this.state.maxRent > val) {
        minOptions.push(<option key={val} value={`${val}`}>${val}</option>);
      }
      if (!this.state.maxRent || this.state.maxRent > val + 500) {
        minOptions.push(<option key={val + 500} value={`${val + 500}`}>${val + 500}</option>);
      }
    }

    let beds = ['1', '2', '3', '4', '5+'];


    let rentLoc;
    if (this.state.selectedRent) {
      rentLoc = JSON.parse(this.state.selectedRent['geoLocation']);
    }

    return <div className="body">
      <div className="main-content">
        <div className="heading">
          <div className="col-md-12">
            <ol className="breadcrumb">
              <li><a href="#">Home</a></li>
              <li><a href="#">Rentals</a></li>
              <li className="active"><a href="#">San Francisco</a></li>
            </ol>
            <h1>San Francisco Bay Area Rental Property Listings</h1>
          </div>
        </div>
        <div className="filter row" >
          <div className="col-md-1 unpadded back-to-rentals">

            <h5> <i className="fa fa-2x fa-fw fa-map-pin"></i> <br/>Bay Area</h5>
          </div>
          <div className="col-md-11 filter-form">
            <form>
              <div className="row">
                <div className="col-md-1 filter-icon text-center">
                  <i className="fa fa-5x fa-filter"></i>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="max-rent">Min Rent</label>
                    <select id="max-rent" className="form-control" value={`${this.state.minRent}`} onChange={this.selectMin}>
                      <option value={null}>Choose ...</option>
                      {minOptions}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="min-rent">Max Rent</label>
                    <select id="min-rent" className="form-control" value={`${this.state.maxRent}`} onChange={this.selectMax}>
                      <option value={null}>Choose ...</option>
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
                        if (this.state.beds == val) {
                          cls = 'btn btn-xs btn-danger';
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
                <div className="col-md-2 more-items">
                  <div className="form-group button-actions">
                    {this.state.beds || this.state.bath || this.state.maxRent || this.state.minRent ?
                    <button type="button" onClick={this.clearFilter} className="btn btn-warning">Clear</button>
                    : null}
                    <button type="button" onClick={this.moreFilter} className={`btn btn-{this.state.more ? 'normal' : 'danger'}`}> {this.state.more ? 'Close' : 'More'}</button>
                  </div>
                </div>
              </div>
              {this.state.more ?
              <div className="row">
                <div className="col-md-offset-1 col-md-2">
                  <div className="form-group">
                    <label>Baths</label><br/>
                    <div className="page-no">
                      {beds.map(val => {
                        let cls = 'btn btn-xs';
                        if (this.state.bath == val) {
                          cls = 'btn btn-xs btn-danger';
                        }

                        return <span key={val}>
                          <button type="button" onClick={e => this.selectBath(val)} className={cls}>{val}</button>&nbsp;
                        </span>
                      })}
                    </div>
                  </div>
                </div>
              </div>
              : null}
            </form>
          </div>
        </div>
        <div className="results-figure">
          <div className="col-md-2 results-count">
            <span>69 Results</span>
          </div>
          <div className="results-pag col-md-10 clearfix ">
            <ul>
             <li className="active">
               <a href="#">1</a>
             </li>
             <li>
               <a href="#">2</a>
             </li>
             <li>
               <a href="#">3</a>
             </li>
             <li>
               <a href="#">4</a>
             </li>
             <li>
               <a href="#">5</a>
             </li>
          </ul>
          </div>
        </div>
        <div className="row clearfix results-section">
            <div className="result-item col-md-6">

                <div className="image-carousel">
                  <div className="like-button"></div>
                   <div className="slide-pag">
                      <a href="#" className="next"><i className="fa fa-chevron-right"></i></a>
                      <a href="#" className="prev"><i className="fa fa-chevron-left"></i></a>

                    </div>
                  <div className="owl-carousel owl-theme">
                        <div className="item">
                          <img className="img-responsive" src="http://placehold.it/400x250"/>
                        </div>
                  </div>

                </div>
                <div className="item-description">
                  <div className="soon pull-right">
                    Coming Soon
                  </div>
                  <h5>
                    266 Ney St · San Francisco
                  </h5>
                  <h6>
                    2 bed, 1 bath · 1100 sqft · 650 credit

                  </h6>
                </div>
            </div>
             <div className="result-item col-md-6">

                <div className="image-carousel">
                  <div className="like-button"></div>
                   <div className="slide-pag">
                      <a href="#" className="next"><i className="fa fa-chevron-right"></i></a>
                      <a href="#" className="prev"><i className="fa fa-chevron-left"></i></a>

                    </div>
                  <div className="owl-carousel owl-theme">
                        <div className="item">
                          <img className="img-responsive" src="http://placehold.it/400x250"/>
                        </div>
                  </div>

                </div>
                <div className="item-description">
                  <div className="soon pull-right">
                    Coming Soon
                  </div>
                  <h5>
                    266 Ney St · San Francisco
                  </h5>
                  <h6>
                    2 bed, 1 bath · 1100 sqft · 650 credit

                  </h6>
                </div>
            </div>
             <div className="result-item col-md-6">

                <div className="image-carousel">
                  <div className="like-button"></div>
                   <div className="slide-pag">
                      <a href="#" className="next"><i className="fa fa-chevron-right"></i></a>
                      <a href="#" className="prev"><i className="fa fa-chevron-left"></i></a>

                    </div>
                  <div className="owl-carousel owl-theme">
                        <div className="item">
                          <img className="img-responsive" src="http://placehold.it/400x250"/>
                        </div>
                  </div>

                </div>
                <div className="item-description">
                  <div className="soon pull-right">
                    Coming Soon
                  </div>
                  <h5>
                    266 Ney St · San Francisco
                  </h5>
                  <h6>
                    2 bed, 1 bath · 1100 sqft · 650 credit

                  </h6>
                </div>
            </div>
             <div className="result-item col-md-6">

                <div className="image-carousel">
                  <div className="like-button"></div>
                   <div className="slide-pag">
                      <a href="#" className="next"><i className="fa fa-chevron-right"></i></a>
                      <a href="#" className="prev"><i className="fa fa-chevron-left"></i></a>

                    </div>
                  <div className="owl-carousel owl-theme">
                        <div className="item">
                          <img className="img-responsive" src="http://placehold.it/400x250"/>
                        </div>
                  </div>

                </div>
                <div className="item-description">
                  <div className="soon pull-right">
                    Coming Soon
                  </div>
                  <h5>
                    266 Ney St · San Francisco
                  </h5>
                  <h6>
                    2 bed, 1 bath · 1100 sqft · 650 credit

                  </h6>
                </div>
            </div>

        </div>
         <div className="results-figure fixed-bottom" >
          <div className="col-md-2 results-count">
            <span>69 Results</span>
          </div>
          <div className="results-pag col-md-10 clearfix ">
            <ul>
             <li className="active">
               <a href="#">1</a>
             </li>
             <li>
               <a href="#">2</a>
             </li>
             <li>
               <a href="#">3</a>
             </li>
             <li>
               <a href="#">4</a>
             </li>
             <li>
               <a href="#">5</a>
             </li>
          </ul>
          </div>
        </div>
        {/*{this.state.loading ?
        <div className="loading"><i className="fa fa-spin fa-spinner"></i> Loading ...</div>
        : null}

        {this.state.rentals && this.state.rentals.length ?
        <div className="rentals">
          {this.getPagination()}
          <div className="rental-list">
            {this.state.rentals.map(rental => {
              let loc = JSON.parse(rental['geoLocation']);
              return <div className="rental-item" key={rental['id']}>
                <div className="place-img" style={{ backgroundImage: `url(https://maps.googleapis.com/maps/api/streetview?location=${loc['lat']},${loc['lng']}&size=1280x720&fov=90&key=AIzaSyAp2FJJJNV6peSh8vHfXxb680UQZh7f33E)` }}></div>
                <strong>{rental['address']} {rental['city']}</strong>
                <span className="pull-right">
                  {rental['targetRent'] ?
                    <span color="green">${rental['targetRent']}</span> :
                    <i color="blue">Coming Soon!</i>}
                </span><br/>
                <small className="muted">
                  {rental['bedCount']} bed{rental['bedCount'] > 1 ? 's' : ''}, &nbsp;
                  {rental['bathroomCount']} bath{rental['bathroomCount'] > 1 ? 's' : ''},  &nbsp;
                  {rental['totalArea']} sqft,  &nbsp;
                  {rental['minimumCreditStore']} credit
                </small>
              </div>
            })}
          </div>
          {this.getPagination()}
        </div>
        : null}*/}

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
  }
}

ReactDOM.render(<Home />, document.getElementById('react-main'));
