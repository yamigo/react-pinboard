'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = require('prop-types');
var React = require('react');
var ReactDOM = require('react-dom');
var debounce = require('lodash.debounce');

var _createColumnOrdering = function _createColumnOrdering(childWeights, numCols) {
  var columns = [];
  var columnWeights = [];

  for (var i = 0; i < numCols; i++) {
    columns.push([]);
    columnWeights.push(0);
  }

  childWeights.forEach(function (weight, index) {
    var smallestColumnIndex = columnWeights.indexOf(Math.min.apply(null, columnWeights));
    columns[smallestColumnIndex].push(index);
    columnWeights[smallestColumnIndex] += weight;
  });

  return columns;
};

var ReactPinboard = function (_React$Component) {
  _inherits(ReactPinboard, _React$Component);

  function ReactPinboard(props) {
    _classCallCheck(this, ReactPinboard);

    var _this = _possibleConstructorReturn(this, (ReactPinboard.__proto__ || Object.getPrototypeOf(ReactPinboard)).call(this, props));

    _this.childRefs = [];
    // Since we don't have DOM nodes to weigh yet, pretend all children are
    // equal-height for the initial, naive rendering.
    var childWeights = props.children.map(function () {
      return 1;
    });
    _this.state = {
      columns: _createColumnOrdering(childWeights, _this.getNumCols())
    };
    return _this;
  }

  _createClass(ReactPinboard, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._debouncedForceRefresh = debounce(this.forceRefresh.bind(this), 100);
      window.addEventListener('resize', this._debouncedForceRefresh);
      setTimeout(this._debouncedForceRefresh, 2000);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('resize', this._debouncedForceRefresh);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.forceRefresh();
    }
  }, {
    key: 'forceRefresh',
    value: function forceRefresh() {
      var childWeights = this.childRefs.map(function (c) {
        var node = ReactDOM.findDOMNode(c);
        if (!(node && node.children && node.children.length > 0)) {
          return 1;
        }

        return node.children[0].offsetHeight;
      });
      var newColumns = _createColumnOrdering(childWeights, this.getNumCols());

      if (JSON.stringify(newColumns) !== JSON.stringify(this.state.columns)) {
        this.setState({ columns: newColumns });
      }
    }
  }, {
    key: 'getNumCols',
    value: function getNumCols() {
      if (typeof this.props.cols === 'number') {
        return this.props.cols;
      } else {
        if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
          // Server-renders and browser without matchMedia should use the last col
          // value provided, which should represent the smallest viewport.
          return this.props.cols[this.props.cols.length - 1].cols;
        } else {
          // Return the cols for the first-matching media query
          return this.props.cols.filter(function (opt) {
            return window.matchMedia(opt.media).matches;
          })[0].cols;
        }
      }
    }
  }, {
    key: 'getStyles',
    value: function getStyles() {
      return {
        pinColumn: {
          width: 'calc(' + 100 / this.getNumCols() + '% - ' + (this.getNumCols() - 1) / this.getNumCols() + ' * ' + this.props.spacing + ')',
          float: 'left',
          marginRight: this.props.spacing
        },
        pinWrapper: {
          marginBottom: this.props.spacing
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { style: this.getStyles().pinboard },
        this.state.columns.map(this.renderColumn, this),
        React.createElement('div', { style: { clear: 'left' } })
      );
    }
  }, {
    key: 'renderColumn',
    value: function renderColumn(childIndexes, columnIndex) {
      var style = _extends({}, this.getStyles().pinColumn, columnIndex === this.state.columns.length - 1 && { marginRight: 0 });

      return React.createElement(
        'div',
        { style: style, key: childIndexes[0] },
        childIndexes.map(this.renderChild, this)
      );
    }
  }, {
    key: 'renderChild',
    value: function renderChild(index) {
      var _this2 = this;

      return React.createElement(
        'div',
        { style: this.getStyles().pinWrapper, key: index, ref: function ref(c) {
            _this2.childRefs[index] = c;
          } },
        this.props.children[index]
      );
    }
  }]);

  return ReactPinboard;
}(React.Component);

ReactPinboard.defaultProps = {
  cols: 2,
  spacing: '1em'
};

ReactPinboard.propTypes = {
  cols: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.shape({
    media: PropTypes.string,
    cols: PropTypes.number.isRequired
  }))]),
  spacing: PropTypes.string
};

module.exports = ReactPinboard;