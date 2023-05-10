import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"

class PlaneGeometry extends THREE.BufferGeometry {

	constructor(
		start,
		end,
		widthSegments,
		heightSegments,
	) {

		super()

		const width = end.z - start.z
		const height = end.y - start.y

		const width_half = width / 2
		const height_half = height / 2

		const gridX = Math.floor( widthSegments )
		const gridY = Math.floor( heightSegments )

		const gridX1 = gridX + 1
		const gridY1 = gridY + 1

		const segment_width = width / gridX
		const segment_height = height / gridY

		//

		const indices = []
		const vertices = []
		const normals = []
		const uvs = []

		const angle = start.angleTo( end )

		for ( let iy = 0; iy < gridY1; iy ++ ) {

			// const y = iy * segment_height - height_half
			const y = iy * segment_height + start.y

			for ( let ix = 0; ix < gridX1; ix ++ ) {

				// const x = ix * segment_width - width_half
				const x = ix * segment_width + start.z

				const v3 = new THREE.Vector3( x, start.y, y )

				// v3.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), angle )

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

		this.setIndex( indices );
		this.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
		// this.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
		this.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )
	}
}

const { scene } = setup()

const elevation = 0
const height = 2

const vertices = [
	[ 0, 0 ],
	[ 2, 2 ],
]

/*const count = vertices.length

for ( let i = 0; i < count - 1; i++ ) {

	const A = vertices[ i ]
	const B = vertices[ i + 1 ]

	const start = new THREE.Vector3( A[ 0 ], A[ 1 ], 0 )
	const end = new THREE.Vector3( B[ 0 ], height, 0 )

	const geometry = new PlaneGeometry( start, end, 4, 4 )
	const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
	map.colorSpace = THREE.SRGBColorSpace
	const material = new THREE.MeshBasicMaterial( {
		color: 0x000000,
		wireframe: true,
	} )
	scene.add( new THREE.Mesh( geometry, material ) )
}*/

const start = new THREE.Vector3( 0, 0, 0 )
const end = new THREE.Vector3( 2, height, 0 )

const geometry = new PlaneGeometry( start, end, 4, 4 )
const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
map.colorSpace = THREE.SRGBColorSpace
const material = new THREE.MeshBasicMaterial( {
	color: 0x000000,
	wireframe: true,
} )
scene.add( new THREE.Mesh( geometry, material ) )
