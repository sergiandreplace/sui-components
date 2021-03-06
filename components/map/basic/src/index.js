import React, {Component} from 'react'
import PropTypes from 'prop-types'
import LeafletMap from './leaflet/map'
import { mapViewModes, NO_OP } from './leaflet/constants'

class MapBasic extends Component {
  constructor (props) {
    super(props)
    this.setMapEventDefinition()
    this.mapInstance = undefined
    this.isHeatmapVisible = false
    this.isSatelliteView = false
  }

  setMapEventDefinition () {
    this.mapEventList = [
      {
        name: 'leaflet_map_click',
        handleFunction: (evt) => this.props.onMapClick(evt.detail)
      },
      {
        name: 'leaflet_map_dragend',
        handleFunction: (evt) => this.props.onMapDragEnd(evt.detail)
      },
      {
        name: 'leaflet_map_loaded',
        handleFunction: (evt) => this.props.onMapLoad(evt.detail)
      },
      {
        name: 'leaflet_map_zoomend',
        handleFunction: (evt) => this.props.onMapZoomEnd(evt.detail)
      },
      {
        name: 'leaflet_map_layer_normal',
        handleFunction: (evt) => this.props.onNormalView(evt.detail)
      },
      {
        name: 'leaflet_map_poiclick',
        handleFunction: (evt) => this.props.onPoiClick(evt.detail)
      },
      {
        name: 'leaflet_map_poimouseout',
        handleFunction: () => this.props.onPoiMouseOut()
      },
      {
        name: 'leaflet_map_poimouseover',
        handleFunction: (evt) => this.props.onPoiMouseOver(evt.detail)
      },
      {
        name: 'leaflet_map_layer_satellite',
        handleFunction: (evt) => this.props.onSatelliteView(evt.detail)
      }
    ]
  }

  getMapConfig () {
    return {
      id: this.props.id,
      heatMapUrl: this.props.heatMapUrl,
      latitude: this.props.center[0],
      longitude: this.props.center[1],
      literals: this.props.literals,
      maxZoom: this.props.maxZoom,
      minZoom: this.props.minZoom,
      polygons: this.props.polygons,
      showHeatmap: this.props.showHeatmap,
      showSatelliteView: this.props.showSatelliteView,
      mapViewModes: this.props.mapViewModes,
      selectedMapViewMode: this.props.selectedMapViewMode,
      zoomControl: this.props.zoomable,
      zoomControlPosition: this.props.zoomControlPosition,
      icons: this.props.icons,
      enableViewMenu: this.props.enableViewMenu,
      dragging: this.props.isInteractable,
      zoom: this.props.zoom,
      appId: this.props.appId,
      appCode: this.props.appCode,
      mapDOMInstance: this.mapDOMInstance,
      scrollWheelZoom: this.props.scrollWheelZoom
    }
  }

  subscribeToMapEvents () {
    this.mapEventList.forEach(mapEvent => this.mapDOMInstance.addEventListener(mapEvent.name, mapEvent.handleFunction))
  }

  unsubscribeFromMapEvents () {
    this.mapEventList.forEach(mapEvent => this.mapDOMInstance.removeEventListener(mapEvent.name, mapEvent.handleFunction))
  }

  checkWhichViewShouldBeDisplayed (showSatelliteView) {
    if (showSatelliteView && !this.isSatelliteView) {
      this.isSatelliteView = true
      this.mapInstance.setView(mapViewModes.SATELLITE)
    } else if (!showSatelliteView && this.isSatelliteView) {
      this.isSatelliteView = false
      this.mapInstance.setView(mapViewModes.NORMAL)
    }
  }

  checkIfHeatMapShouldBeDisplayed (showHeatmap, url) {
    if (showHeatmap && !this.isHeatmapVisible) {
      this.isHeatmapVisible = true
      this.mapInstance.showHeatMap(url)
    } else if (!showHeatmap && this.isHeatmapVisible) {
      this.isHeatmapVisible = false
      this.mapInstance.removeHeatMapLayer()
    }
  }

  componentWillUnmount () {
    this.unsubscribeFromMapEvents()
  }

  shouldComponentUpdate () {
    // The component itself has no changes. All changes are managed through leaflet maps api.
    return false
  }

  componentWillReceiveProps ({heatMapUrl, pois, showHeatmap, showSatelliteView}) {
    this.mapInstance.displayPois(pois)
    this.checkIfHeatMapShouldBeDisplayed(showHeatmap, heatMapUrl)
    this.checkWhichViewShouldBeDisplayed(showSatelliteView)
  }

  componentDidMount () {
    this.subscribeToMapEvents()
    this.mapInstance = new LeafletMap(this.getMapConfig())
    this.mapInstance.displayPois(this.props.pois)
  }

  render () {
    return (
      <div
        className='re-Wrapper sui-MapBasic'
        style={this.props.height && {height: this.props.height}}
        ref={(ele) => {
          this.mapDOMInstance = ele
        }}
        id={this.props.id}
      />
    )
  }
}

MapBasic.propTypes = {
  appCode: PropTypes.string.isRequired,
  appId: PropTypes.string.isRequired,
  /**
   * An array composed by lat and lng like: [lat, lng]
   */
  center: PropTypes.array.isRequired,
  /**
   * Heat map url is the source where we are going to get the heatMap layers
   */
  heatMapUrl: PropTypes.string,
  /**
   * In some cases our styles will be loaded after our map being created. In this cases we must specify our map height by code F.E on sui-studio
   */
  height: PropTypes.string,
  /**
   * The DOM Id that we would like to have on our map div if none is provided 'map-container' will be its id.
   */
  id: PropTypes.string,
  literals: PropTypes.object,
  /**
   * Array of map view modes. Those models are defined could be: mapViewModes.NORMAL, mapViewModes.SATELLITE
   */
  mapViewModes: PropTypes.array.isRequired,
  /**
   * A number used to lock the max zoom that a user can do.
   */
  maxZoom: PropTypes.number,
  /**
   * A number used to lock the min zoom or zoom out that a user can do.
   */
  minZoom: PropTypes.number,
  onMapClick: PropTypes.func,
  onMapDragEnd: PropTypes.func,
  onMapLoad: PropTypes.func,
  onMapZoomEnd: PropTypes.func,
  onNormalView: PropTypes.func,
  onPoiClick: PropTypes.func,
  onPoiMouseOut: PropTypes.func,
  onPoiMouseOver: PropTypes.func,
  onSatelliteView: PropTypes.func,
  /**
   * An array of points of interest. More info and examples on readme.
   */
  pois: PropTypes.array,
  /**
   * An array of polygons. Where we can build forms on our map.
   */
  polygons: PropTypes.object,
  /**
   * A number to specify which of our map view modes is selected.
   * For example if our mapViewModes are: [mapViewModes.NORMAL, mapViewModes.SATELLITE] and we set this to 0 our selected map will be NORMAL.
   */
  selectedMapViewMode: PropTypes.number,
  /**
   * Whether our map should show the heat map. The usage of this prop is attached to our heatMapUrl.
   */
  showHeatmap: PropTypes.bool,
  /**
   * Used to call setView internal function and force to show the Satellite view.
   */
  showSatelliteView: PropTypes.bool,
  /**
   * The init zoom of our map
   */
  zoom: PropTypes.number,
  /**
   * Set to false to disable the zoom
   */
  zoomable: PropTypes.bool,
  /**
   * Where should be displayed our zoomControl if it is enabled.
   */
  zoomControlPosition: PropTypes.string,
  /**
   * Show layers menu to let the user select satellite or normal.
   */
  enableViewMenu: PropTypes.bool,
  /**
   * An array of icons that will be added as markers to our map. Not the same purpose as POI's
   */
  icons: PropTypes.array,
  /**
   * BY DEFAULT set to true. Set it to false to disable the use to drag and move on the map.
   */
  isInteractable: PropTypes.bool,
  /**
   * This property indicates if the map zooms in or out in response to mouse wheel events.
   */
  scrollWheelZoom: PropTypes.bool
}

MapBasic.defaultProps = {
  id: 'map-container',
  center: [40.00237, -3.99902],
  maxZoom: 20,
  minZoom: 6,
  mapViewModes: [mapViewModes.NORMAL, mapViewModes.SATELLITE],
  selectedMapViewMode: 0,
  zoom: 14,
  zoomControlPosition: 'bottomleft',
  zoomable: false,
  isInteractable: true,
  scrollWheelZoom: true,
  onMapClick: NO_OP,
  onMapDragEnd: NO_OP,
  onMapLoad: NO_OP,
  onMapZoomEnd: NO_OP,
  onNormalView: NO_OP,
  onPoiClick: NO_OP,
  onPoiMouseOut: NO_OP,
  onPoiMouseOver: NO_OP,
  onSatelliteView: NO_OP
}

MapBasic.displayName = 'MapBasic'

export default MapBasic
