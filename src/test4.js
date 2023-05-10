import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"

class PlaneGeometry extends THREE.BufferGeometry {

	constructor(
		width = 1, height = 1, widthSegments = 1, heightSegments = 1,
		A = new THREE.Vector3(),
	) {

		super()

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

		for ( let iy = 0; iy < gridY1; iy ++ ) {

			const y = iy * segment_height - height_half

			for ( let ix = 0; ix < gridX1; ix ++ ) {

				const x = ix * segment_width - width_half

				const v3 = new THREE.Vector3( x, - y, 0 )

				// v3.add( A )

				vertices.push( ...v3 )

				normals.push( 0, 0, 1 )

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

const geometry = new PlaneGeometry()

const position = geometry.attributes.position
const points = []

const vertices = [
	[ 0, 0, 0 ],
	[ 5, 0, 0 ],
	[ 5, 0, 5 ],
	[ 0, 0, 5 ],
	[ 0, 0, 0 ],
]

{
	const geometry = new THREE.BufferGeometry().setAttribute( "position", new THREE.Float32BufferAttribute( vertices.flat(), 3 ) )
	const material = new THREE.PointsMaterial( { size: 0.5 } )
	scene.add( new THREE.Points( geometry, material ) )
}

const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
map.colorSpace = THREE.SRGBColorSpace

for ( let s = 0; s < vertices.length - 1; s++ ) {

	const A = new THREE.Vector3( ...vertices[ s ] )
	const B = new THREE.Vector3( ...vertices[ s + 1 ] )
	const C = A.clone()

	C.add( B ).divideScalar( 2 )

	const angle = A.angleTo( B )

	const geometry = new PlaneGeometry( 1, 1, 1, 1, A )
	const position = geometry.attributes.position

	const material = new THREE.MeshBasicMaterial( { wireframe: true } )
	const mesh = new THREE.Mesh( geometry, material )

	mesh.position.add( C )
	mesh.rotateY( Math.PI / 2 )

	// scene.add( mesh )

	const points = []

	for ( let i = 0; i < position.count; i++ ) {

		const v3 = new THREE.Vector3().fromBufferAttribute( position, i )

		// v3.add( C )

		const m4 = new THREE.Matrix4()

		m4.makeRotationY( C.clone().setLength( C.length() * 2 ).angleTo( B ) )

		v3.applyMatrix4( m4 )
		m4.makeTranslation( C.x, C.y, C.z )
		v3.applyMatrix4( m4 )

		// v3.applyAxisAngle( new THREE.Vector3( 1, 1, 1 ), A.angleTo( B ) )

		if ( s === 0 ) {

			// v3.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), v3.angleTo( C ) )
		}
		

		if ( s === 1 ) {

			// v3.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), angle )
		}

		if ( s === 3 ) {

			// v3.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), angle )
		}

		points.push( v3 )
	}

	{
		const extrude = new THREE.BufferGeometry().setFromPoints( points )
		extrude.setIndex( geometry.index )
		extrude.setAttribute( "uv", geometry.attributes.uv.clone() )
		const material = new THREE.MeshBasicMaterial( { map, wireframe: false } )
		scene.add( new THREE.Mesh( extrude, material ) )
	}
}

for ( let i = 0; i < position.count; i++ ) {

	const v3 = new THREE.Vector3().fromBufferAttribute( position, i )

	const m4 = new THREE.Matrix4()

	m4.makeTranslation( 1, 0, 0 )

	v3.applyMatrix4( m4 )

	// points.push( v3 )
}

{
	const extrude = new THREE.BufferGeometry().setFromPoints( points )
	extrude.setIndex( geometry.index )
	const material = new THREE.MeshBasicMaterial()
	// scene.add( new THREE.Mesh( extrude, material ) )
}


const material = new THREE.MeshBasicMaterial( {
	map,
	depthTest: false,
	// wireframe: true,
} )
// scene.add( new THREE.Mesh( geometry, material ) )

