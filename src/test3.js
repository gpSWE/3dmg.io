import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"

class PlaneGeometry extends THREE.BufferGeometry {

	constructor(
		startX = 0,
		startY = 0,
		startZ = 0,
		endX = 1,
		endY = 1,
		endZ = 1,
		widthSegments = 1,
		heightSegments = 1,
	) {

		super()

		const width_half = endX / 2
		const height_half = endY / 2

		const gridX = Math.floor( widthSegments )
		const gridY = Math.floor( heightSegments )

		const gridX1 = gridX + 1
		const gridY1 = gridY + 1

		const segment_width = endX / gridX
		const segment_height = endY / gridY

		//

		const indices = []
		const vertices = []
		const normals = []
		const uvs = []

		for ( let iy = 0; iy < gridY1; iy ++ ) {

			const z = iy * segment_height + startY
			// const z = iy * segment_height - height_half

			for ( let ix = 0; ix < gridX1; ix ++ ) {

				// const x = ix * segment_width - width_half
				const x = ix * segment_width - endX - startX

				const v3 = new THREE.Vector3( x, 0, z )

				const angle = 0

				v3.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), angle )

				vertices.unshift( ...v3 )

				normals.push( 0, 1, 0 )

				uvs.push( ix / gridX )
				uvs.push( 1 - ( iy / gridY ) )
			}
		}

		for ( let iy = 0; iy < gridY; iy ++ ) {

			for ( let ix = 0; ix < gridX; ix ++ ) {

				const a = ix + gridX1 * iy
				const b = ix + gridX1 * ( iy + 1 )
				const c = ( ix + 1 ) + gridX1 * ( iy + 1 )
				const d = ( ix + 1 ) + gridX1 * iy

				indices.push( a, b, d )
				indices.push( b, c, d )
			}
		}

		this.setIndex( indices )
		this.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
		this.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
		this.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )

	}
}

const { scene } = setup()

const start = new THREE.Vector3( 0, 0, 1 )
const end = new THREE.Vector3( 0, 2, 1 )

const geometry = new PlaneGeometry( start.x, start.y, start.z, end.x, end.y, end.z, 32, 32 )

const material = new THREE.MeshBasicMaterial( {
	// metalness: 0.5,
	// roughness: 0.5,
	color: 0x000000,
	wireframe: true,
	// side: 2,
	// map: new THREE.TextureLoader().load( "0518-3-1024x1024.jpg" ),
	// map: new THREE.TextureLoader().load( "uvcheck.jpg" ),
	// map: new THREE.TextureLoader().load( "UVbw.png" ),
} )

const mesh = new THREE.Mesh( geometry, material )

const size = new THREE.Vector3()
const box3 = new THREE.Box3().setFromObject( mesh )

box3.getSize( size )

console.log( box3 )

scene.add( mesh )

{
	const vertices = [
		0, 0, 0,
		2, 0, 0,
	]
	const geometry = new THREE.BufferGeometry().setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
	const material = new THREE.PointsMaterial( { color: 0x000000, size: 0.25 } )
	const mesh = new THREE.Points( geometry, material )
	scene.add( mesh )
}
