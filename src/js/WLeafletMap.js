/*
 * Copyright (C) 2019 Emweb bvba, Herent, Belgium.
 *
 * See the LICENSE file for terms of use.
 */

/* Note: this is at the same time valid JavaScript and C++. */

WT_DECLARE_WT_MEMBER
(1, JavaScriptConstructor, "WLeafletMap",
  function(APP, el, lat, lng, zoom) {
    el.wtObj = this;

    var self = this;
    var WT = APP.WT;

    var map;
    var markers = {};

    var lastZoom = zoom;
    var lastLatLng = [lat, lng];

    this.addTileLayer = function(url_template, options_str) {
      var options = JSON.parse(options_str);
      L.tileLayer(url_template, options).addTo(map);
    };

    this.zoom = function(zoom) {
      lastZoom = zoom;
      map.setZoom(zoom);
    };
    
    this.panTo = function(lat, lng) {
      lastLatLng = [lat, lng];
      map.panTo([lat, lng]);
    };

    this.addPolyline = function(points, options_str) {
      var options = JSON.parse(options_str);
      L.polyline(points, options).addTo(map);
    };

    this.addCircle = function(center, options_str) {
      var options = JSON.parse(options_str);
      L.circle(center, options).addTo(map);
    };

    this.addMarker = function(marker_id, marker) {
      marker.addTo(map);
      markers[marker_id] = marker;
    };

    this.removeMarker = function(marker_id) {
      var marker = markers[marker_id];
      if (marker) {
        map.removeLayer(marker);
        delete markers[marker_id];
      }
    };

    this.moveMarker = function(marker_id, position) {
      var marker = markers[marker_id];
      if (marker) {
        marker.setLatLng(position);
      }
    };

    el.wtEncodeValue = function() {
      var center = map.getCenter();
      var position = [center.lat, center.lng];
      var zoom = map.getZoom();
      return JSON.stringify({
        position: position,
        zoom: zoom
      });
    };

    this.init = function(position, zoom) {
      map = L.map(el, {
        center: position,
        zoom: zoom
      });
      map.on('zoomend', function() {
        var zoom = map.getZoom();
        if (zoom != lastZoom) {
          APP.emit(el, 'zoomLevelChanged', zoom);
          lastZoom = zoom;
        }
      });
      map.on('moveend', function() {
        var center = map.getCenter();
        if (center.lat != lastLatLng[0] ||
            center.lng != lastLatLng[1]) {
          APP.emit(el, 'panChanged', center.lat, center.lng);
          lastLatLng = [center.lat, center.lng];
        }
      });
    };

    this.init([lat, lng], zoom);
  });