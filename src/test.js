import "./main.css"
import * as THREE from "three"
import * as earcut from "earcut"
import { setup } from "./setup"

const generateUV = ( points, uComponent = 0, vComponent = 1 ) => {

	// const points = []

	// for ( let i = 0; i < vertices.length; i += 3 ) {

	// 	points.push( new THREE.Vector3( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] ) )
	// }

	const box3 = new THREE.Box3().setFromPoints( points )
	const size = new THREE.Vector3()
	box3.getSize( size )

	const uv = []
	const v3 = new THREE.Vector3()

	for ( let i = 0; i < points.length; i++ ) {

		const u = ( points[ i ].getComponent( uComponent ) - box3.min.getComponent( uComponent ) ) / size.getComponent( uComponent )
		const v = ( points[ i ].getComponent( vComponent ) - box3.min.getComponent( vComponent ) ) / size.getComponent( vComponent )

		uv.push( u, v )
	}

	return uv
}

const exterior = [
	[ 0, 0 ],
	[ 0, 20 ],
	[ 20, 20 ],
	[ 20, 0 ],
	// [ 0, 0 ],
]

const interior = [
	[ 5, 5 ],
	[ 10, 5 ],
	[ 10, 10 ],
	[ 5, 10 ],
	// [ 5, 5 ],
]

const coordinates = [ exterior ]

const vertices = []

const exteriorPoints = []

for ( const position of coordinates.flat() ) {

	vertices.push( ...position, 0 )

	exteriorPoints.push( new THREE.Vector3( ...position, 0 ) )
}

console.log( generateUV( exteriorPoints, 0, 1 ) )

const { scene, camera, renderer } = setup()

const data = earcut.flatten( coordinates )

const indices = earcut( data.vertices, data.holes, data.dimensions )
// console.log( indices )

const base = new THREE.BufferGeometry()

base.setIndex( indices )
base.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
base.computeVertexNormals()

const material = new THREE.MeshNormalMaterial( { side: THREE.FrontSide } )
const mesh = new THREE.Mesh( base, material )

scene.add( mesh )

// Extrude

const height = 30
const side = THREE.FrontSide

{
	const position = base.attributes.position

	for ( let i = 0; i < position.count - 1; i++ ) {

		const A = new THREE.Vector3().fromBufferAttribute( position, i )
		const B = new THREE.Vector3().fromBufferAttribute( position, i + 1 )

		const C = B.clone().setComponent( 2, B.z + height )
		const D = A.clone().setComponent( 2, A.z + height )

		const points = [ A, B, C, D ]
		const vertices = [ ...A, ...B, ...C, ...D ]

		const indices = [ 1, 0, 3, 3, 2, 1 ]

		const geometry = new THREE.BufferGeometry()

		geometry.setIndex( indices )
		geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
		geometry.computeVertexNormals()

		// console.log( generateUV( points, 1, 2 ) )

		const material = new THREE.MeshNormalMaterial()
		const mesh = new THREE.Mesh( geometry, material )

		scene.add( mesh )
	}
}

{
	const geometry = new THREE.BoxGeometry( 50, 50, 50 )
	const material = new THREE.MeshNormalMaterial( { side: THREE.FrontSide } )
	const mesh = new THREE.Mesh( geometry, material )

	// scene.add( mesh )
}
