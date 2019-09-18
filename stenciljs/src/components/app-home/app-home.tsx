import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: false
})
export class AppHome {

  render() {
    return (
      <div class='app-home'>
        <p class="w3-wide w3-display-middle w3-center">
        <stencil-route-link anchorClass="startlink" url="/station" exact={true}>Stationssökning</stencil-route-link>
        <br/>
        <stencil-route-link anchorClass="startlink" url="/train" exact={true}>Tågsökning</stencil-route-link>
        </p>
      </div>
    );
  }
}
