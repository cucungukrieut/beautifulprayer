import React, { Component } from 'react';
import adhan from 'adhan';
import cookie from 'react-cookie';

import TopPanel from './TopPanel';
import PrayerBlock from './PrayerBlock';
import Loader from './Loader';

import getLocation from './utils/getLocation';

import './App.css';

class App extends Component {
  state = {
    method: cookie.load('method') || 'MuslimWorldLeague',
    madhab: cookie.load('madhab') || 'Shafi'
  };

  componentWillMount() {
    getLocation().then(({ location }) => this.setState({
      coordinates: new adhan.Coordinates(location.lat, location.lng)
    }));
  }

  getPrayerTimes() {
    const date = new Date();
    const params = adhan.CalculationMethod[this.state.method]();
    params.madhab = adhan.Madhab[this.state.madhab];

    let times = new adhan.PrayerTimes(
      this.state.coordinates,
      date,
      params
    );

    if (times.nextPrayer() === 6) {
      date.setDate(date.getDate() + 1);

      times = new adhan.PrayerTimes(
        this.state.coordinates,
        date,
        params
      );
    }

    return times;
  }

  getTimesList() {
    return Object.keys(adhan.Prayer).filter(name => name !== 'None');
  }

  getNextPrayer() {
    const nextPrayerIndex = this.getPrayerTimes().nextPrayer();
    const prayerName = this.getTimesList()[nextPrayerIndex].toLowerCase();

    return { name: prayerName, time: this.getPrayerTimes()[prayerName] };
  }

  handleMadhabChange = (event) => {
    cookie.save('madhab', event.target.value);
    this.setState({ madhab: event.target.value });
  }

  handleMethodChange = (event) => {
    cookie.save('method', event.target.value);
    this.setState({ method: event.target.value });
  }

  handleLocationChange = ({ location, gmaps }) => {
    this.setState({
      coordinates: new adhan.Coordinates(location.lat, location.lng)
    });
  }

  render() {
    if (!this.state.coordinates) return <Loader />;
    const offset = new Date().getTimezoneOffset() / (60 * -1);

    // console.log(this.getNextPrayer(), this.getPrayerTimes(), this.getRemainingPrayers());
    console.log(adhan, this.getNextPrayer(), this.getPrayerTimes());

    return (
      <div className="App">
        <TopPanel
          method={this.state.method}
          madhab={this.state.madhab}
          nextPrayer={{ name: this.getNextPrayer().name, time: adhan.Date.formattedTime(this.getNextPrayer().time, offset) }}
          onMethodChange={this.handleMethodChange}
          onMadhabChange={this.handleMadhabChange}
          onLocationChange={this.handleLocationChange}
        />
        <div className="prayer-blocks">
          {
            this.getTimesList().map(name => (
              <PrayerBlock
                key={name}
                prayer={{ name, time: adhan.Date.formattedTime(this.getPrayerTimes()[name.toLowerCase()], offset) }}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

export default App;
