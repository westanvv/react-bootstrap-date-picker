// See http://jszen.blogspot.com/2007/03/how-to-build-simple-calendar-with.html for calendar logic.

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import {
  Button,
  FormControl,
  InputGroup,
  Overlay,
  Popover,
} from 'react-bootstrap';
import moment from 'moment';

let instanceCount = 0;

const CalendarHeader = createReactClass({
  displayName: 'DatePickerHeader',

  propTypes: {
    displayDate: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    monthLabels: PropTypes.array.isRequired,
    previousButtonElement: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired,
    nextButtonElement: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired,
  },

  handleClickPrevious() {
    const date = this.props.displayDate;
    this.props.onChange(date.month(date.month() - 1));
  },

  handleClickNext() {
    const date = this.props.displayDate;
    this.props.onChange(date.month(date.month() + 1));
  },

  render() {
    return <div className="text-center">
      <div className="text-muted pull-left" onClick={this.handleClickPrevious} style={{cursor: 'pointer'}}>{this.props.previousButtonElement}</div>
      <span>{this.props.monthLabels[this.props.displayDate.month()]} {this.props.displayDate.year()}</span>
      <div className="text-muted pull-right" onClick={this.handleClickNext} style={{cursor: 'pointer'}}>{this.props.nextButtonElement}</div>
    </div>;
  }
});

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const Calendar = createReactClass({
  displayName: 'DatePickerCalendar',

  propTypes: {
    selectedDate: PropTypes.object,
    displayDate: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    dayLabels: PropTypes.array.isRequired,
    cellPadding: PropTypes.string.isRequired,
    weekStartsOnMonday: PropTypes.bool,
    showTodayButton: PropTypes.bool,
    todayButtonLabel: PropTypes.string,
  },

  handleClick(day) {
    const newSelectedDate = moment(this.props.displayDate).date(day);
    this.props.onChange(newSelectedDate);
  },

  handleClickToday() {
    const newSelectedDate = moment().startOf('day').hour(12);
    this.props.onChange(newSelectedDate);
  },

  render() {
    const currentDate = moment();
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();
    const selectedDay = this.props.selectedDate ? this.props.selectedDate.date() : null;
    const selectedMonth = this.props.selectedDate ? this.props.selectedDate.month() : null;
    const selectedYear = this.props.selectedDate ? this.props.selectedDate.year() : null;
    const year = this.props.displayDate.year();
    const month = this.props.displayDate.month();
    const firstDay = moment([year, month, 1]);
    const startingDay = this.props.weekStartsOnMonday ? (firstDay.day() === 0 ? 6 : firstDay.day() - 1) : firstDay.day();

    let monthLength = daysInMonth[month];
    if (month == 1) {
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        monthLength = 29;
      }
    }

    const weeks = [];
    let day = 1;
    for (let i = 0; i < 9; i++) {
      const week = [];
      for (let j = 0; j <= 6; j++) {
        if (day <= monthLength && (i > 0 || j >= startingDay)) {
          const selected = day === selectedDay && month == selectedMonth && year === selectedYear;
          const current = day === currentDay && month == currentMonth && year === currentYear;
          week.push(<td
            key={j}
            onClick={this.handleClick.bind(this, day)}
            style={{cursor: 'pointer', padding: this.props.cellPadding}}
            className={selected ? 'bg-primary' : current ? 'text-muted' : null}>
            {day}
          </td>);
          day++;
        } else {
          week.push(<td key={j} />);
        }
      }

      weeks.push(<tr key={i}>{week}</tr>);
      if (day > monthLength) {
        break;
      }
    }

    return <table className="text-center">
      <thead>
        <tr>
          {this.props.dayLabels.map((label, index)=>{
            return <td
              key={index}
              className="text-muted"
              style={{padding: this.props.cellPadding}}>
              <small>{label}</small>
            </td>;
          })}
        </tr>
      </thead>
      <tbody>
        {weeks}
      </tbody>
      {this.props.showTodayButton && <tfoot>
        <tr>
          <td colSpan={this.props.dayLabels.length} style={{ paddingTop: '9px' }}>
            <Button
              block
              bsSize="xsmall"
              className="u-today-button"
              onClick={this.handleClickToday}>
              {this.props.todayButtonLabel}
            </Button>
          </td>
        </tr>
      </tfoot>}
    </table>;
  }
});

export default createReactClass({
  displayName: 'DatePicker',

  propTypes: {
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    cellPadding: PropTypes.string,
    placeholder: PropTypes.string,
    dayLabels: PropTypes.array,
    monthLabels: PropTypes.array,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    autoFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    weekStartsOnMonday: PropTypes.bool,
    clearButtonElement: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    showClearButton: PropTypes.bool,
    previousButtonElement: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    nextButtonElement: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    calendarPlacement: PropTypes.string,
    dateFormat: PropTypes.string, // 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY'
    bsClass: PropTypes.string,
    bsSize: PropTypes.string,
    calendarContainer: PropTypes.object,
    id: PropTypes.string,
    name: PropTypes.string,
    showTodayButton: PropTypes.bool,
    todayButtonLabel: PropTypes.string,
    customControl: PropTypes.object,
  },

  getDefaultProps() {
    const language = typeof window !== 'undefined' && window.navigator ? (window.navigator.userLanguage || window.navigator.language || '').toLowerCase() : '';
    const dateFormat = !language || language === 'en-us' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
    return {
      cellPadding: '5px',
      dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monthLabels: ['January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'],
      clearButtonElement: '×',
      previousButtonElement: '<',
      nextButtonElement: '>',
      calendarPlacement: 'bottom',
      dateFormat: dateFormat,
      showClearButton: true,
      autoFocus: false,
      disabled: false,
      showTodayButton: false,
      todayButtonLabel: 'Today',
      instanceCount: instanceCount++,
      style: {
        width: '100%'
      }
    };
  },

  getInitialState() {
    if (this.props.value && this.props.defaultValue) {
      throw new Error('Conflicting DatePicker properties \'value\' and \'defaultValue\'');
    }
    const state = this.makeDateValues(this.props.value || this.props.defaultValue);
    if (this.props.weekStartsOnMonday) {
      state.dayLabels = this.props.dayLabels.slice(1).concat(this.props.dayLabels.slice(0,1));
    } else {
      state.dayLabels = this.props.dayLabels;
    }
    state.focused = false;
    state.inputFocused = false;
    state.placeholder = this.props.placeholder || this.props.dateFormat;
    state.separator = this.props.dateFormat.match(/[^A-Z]/)[0];
    return state;
  },

  makeDateValues(isoString) {
    const selectedDate = isoString ? moment(`${isoString.slice(0,10)}T12:00:00.000Z`) : null;
    const inputValue = isoString ? this.makeInputValueString(selectedDate) : null;
    const displayDate = selectedDate || moment();

    return {
      value: selectedDate ? selectedDate.format() : null,
      displayDate: displayDate,
      selectedDate: selectedDate,
      inputValue: inputValue
    };
  },

  clear() {
    if (this.props.onClear) {
      this.props.onClear();
    }
    else {
      this.setState(this.makeDateValues(null));
    }

    if (this.props.onChange) {
      this.props.onChange(null, null);
    }
  },

  handleHide() {
    if (this.state.inputFocused) {
      return;
    }
    this.setState({
      focused: false
    });
    if (this.props.onBlur) {
      const event = document.createEvent('CustomEvent');
      event.initEvent('Change Date', true, false);
      ReactDOM.findDOMNode(this.refs.hiddenInput).dispatchEvent(event);
      this.props.onBlur(event);
    }
  },

  handleKeyDown(e) {
    if (e.which === 9 && this.state.inputFocused) {
      this.setState({
        focused: false
      });

      if (this.props.onBlur) {
        const event = document.createEvent('CustomEvent');
        event.initEvent('Change Date', true, false);
        ReactDOM.findDOMNode(this.refs.hiddenInput).dispatchEvent(event);
        this.props.onBlur(event);
      }
    }
  },

  handleFocus() {
    if (this.state.focused === true) {
      return;
    }

    this.setState({
      inputFocused: true,
      focused: true
    });

    if (this.props.onFocus) {
      const event = document.createEvent('CustomEvent');
      event.initEvent('Change Date', true, false);
      ReactDOM.findDOMNode(this.refs.hiddenInput).dispatchEvent(event);
      this.props.onFocus(event);
    }
  },

  handleBlur() {
    if (this.state.inputValue === '') {
      this.clear();
    }
    this.setState({
      inputFocused: false
    });
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return !(this.state.inputFocused === true && nextState.inputFocused === false);
  },

  getValue() {
    return this.state.selectedDate ? this.state.selectedDate.toISOString() : null;
  },

  getFormattedValue() {
    return this.state.displayDate ? this.state.inputValue : null;
  },

  makeInputValueString(date) {
    return date.format(this.props.dateFormat)
  },

  handleBadInput(originalValue) {
    const parts = originalValue.replace(new RegExp(`[^0-9${this.state.separator}]`), '').split(this.state.separator);
    if (this.props.dateFormat.match(/MM?.DD?.YYYY/) || this.props.dateFormat.match(/DD?.MM?.YYYY/)) {
      if (parts[0] && parts[0].length > 2) {
        parts[1] = parts[0].slice(2) + (parts[1] || '');
        parts[0] = parts[0].slice(0, 2);
      }
      if (parts[1] && parts[1].length > 2) {
        parts[2] = parts[1].slice(2) + (parts[2] || '');
        parts[1] = parts[1].slice(0, 2);
      }
      if (parts[2]) {
        parts[2] = parts[2].slice(0,4);
      }
    } else {
      if (parts[0] && parts[0].length > 4) {
        parts[1] = parts[0].slice(4) + (parts[1] || '');
        parts[0] = parts[0].slice(0, 4);
      }
      if (parts[1] && parts[1].length > 2) {
        parts[2] = parts[1].slice(2) + (parts[2] || '');
        parts[1] = parts[1].slice(0, 2);
      }
      if (parts[2]) {
        parts[2] = parts[2].slice(0,2);
      }
    }
    this.setState({
      inputValue: parts.join(this.state.separator)
    });
  },

  handleInputChange() {

    const originalValue = ReactDOM.findDOMNode(this.refs.input).value;
    const inputValue = originalValue.replace(/(-|\/\/)/g, this.state.separator).slice(0,10);

    const selectedDate = moment(inputValue, this.props.dateFormat, true);
    if (!selectedDate.isValid()) {
      return this.handleBadInput(originalValue);
    }
    this.setState({
      displayDate: selectedDate,
      inputValue: inputValue,
      selectedDate: selectedDate,
      value: selectedDate.format()
    });
    if (this.props.onChange) {
      this.props.onChange(selectedDate.format(), inputValue);
    }
  },

  onChangeMonth(newDisplayDate) {
    this.setState({
      displayDate: newDisplayDate
    });
  },

  onChangeDate(newSelectedDate) {
    const inputValue = this.makeInputValueString(newSelectedDate);
    this.setState({
      inputValue: inputValue,
      selectedDate: newSelectedDate,
      displayDate: newSelectedDate,
      value: newSelectedDate.toISOString(),
      focused: false
    });

    if (this.props.onBlur) {
      const event = document.createEvent('CustomEvent');
      event.initEvent('Change Date', true, false);
      ReactDOM.findDOMNode(this.refs.hiddenInput).dispatchEvent(event);
      this.props.onBlur(event);
    }

    if (this.props.onChange) {
      this.props.onChange(newSelectedDate.toISOString(), inputValue);
    }
  },

  componentWillReceiveProps(newProps) {
    const value = newProps.value;
    if (this.getValue() !== value) {
      this.setState(this.makeDateValues(value));
    }
  },

  render() {
    const calendarHeader = <CalendarHeader
      previousButtonElement={this.props.previousButtonElement}
      nextButtonElement={this.props.nextButtonElement}
      displayDate={this.state.displayDate}
      onChange={this.onChangeMonth}
      monthLabels={this.props.monthLabels}
      dateFormat={this.props.dateFormat} />;

    const control = this.props.customControl
      ? React.cloneElement(this.props.customControl, {
        onKeyDown: this.handleKeyDown,
        value: this.state.inputValue || '',
        placeholder: this.state.focused ? this.props.dateFormat : this.state.placeholder,
        ref: 'input',
        disabled: this.props.disabled,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onChange: this.handleInputChange,
        className: this.props.className,
        style: this.props.style
      })
      : <FormControl
          onKeyDown={this.handleKeyDown}
          value={this.state.inputValue || ''}
          ref="input"
          type="text"
          className={this.props.className}
          style={this.props.style}
          autoFocus={this.props.autoFocus}
          disabled={this.props.disabled}
          placeholder={this.state.focused ? this.props.dateFormat : this.state.placeholder}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleInputChange}
          />;

    return <InputGroup
      ref="inputGroup"
      bsClass={this.props.showClearButton ? this.props.bsClass : ''}
      bsSize={this.props.bsSize}
      id={this.props.id ? `${this.props.id}_group` : null}>
      <Overlay
        rootClose={true}
        onHide={this.handleHide}
        show={this.state.focused}
        container={() => this.props.calendarContainer || ReactDOM.findDOMNode(this.refs.overlayContainer)}
        target={() => ReactDOM.findDOMNode(this.refs.input)}
        placement={this.props.calendarPlacement}
        delayHide={200}>
        <Popover id={`date-picker-popover-${this.props.instanceCount}`} className="date-picker-popover" title={calendarHeader}>
          <Calendar
            cellPadding={this.props.cellPadding}
            selectedDate={this.state.selectedDate}
            displayDate={this.state.displayDate}
            onChange={this.onChangeDate}
            dayLabels={this.state.dayLabels}
            weekStartsOnMonday={this.props.weekStartsOnMonday}
            showTodayButton={this.props.showTodayButton}
            todayButtonLabel={this.props.todayButtonLabel} />
        </Popover>
      </Overlay>
      <div ref="overlayContainer" style={{position: 'relative'}} />
      <input ref="hiddenInput" type="hidden" id={this.props.id} name={this.props.name} value={this.state.value || ''} data-formattedvalue={this.state.value ? this.state.inputValue : ''} />
      {control}
      {this.props.showClearButton && !this.props.customControl && <InputGroup.Addon
        onClick={this.props.disabled ? null : this.clear}
        style={{cursor:(this.state.inputValue && !this.props.disabled) ? 'pointer' : 'not-allowed'}}>
        <div style={{opacity: (this.state.inputValue && !this.props.disabled) ? 1 : 0.5}}>
          {this.props.clearButtonElement}
        </div>
      </InputGroup.Addon>}
    </InputGroup>;
  }
});
