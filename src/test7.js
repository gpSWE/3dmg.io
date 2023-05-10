import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"

const { scene } = setup()

const gridX = 1
const gridY = 1

const buildPlane = (
	width = 1,
	height = 1,
	A = new THREE.Vector3(),
	B = new THREE.Vector3()
) => {

	// width = A.distanceTo( B ) - 0.1

	const width_half = width / 2
	const height_half = height / 2

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

		const y = iy * segment_height - height

		for ( let ix = 0; ix < gridX1; ix ++ ) {

			const x = ix * segment_width

			const v3 = new THREE.Vector3( x, - y, 0 )

			v3.sub( new THREE.Vector3( - A.x, 0, A.y ) )

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

			indices.push( a, b, d, b, c, d )
		}
	}

	return {
		indices,
		vertices,
		normals,
		uvs,
	}
}

scene.add( new THREE.GridHelper() )

const coordinates = [
	[ 0, 0, 0 ],
	[ 2, 0, 0 ],
	[ 3, 2, 0 ],
	[ 4, 2, 0 ],
]

{
	const coords = structuredClone( coordinates )
	coords.pop()
	const geometry = new THREE.BufferGeometry().setAttribute( "position", new THREE.Float32BufferAttribute( coords.flat(), 3 ) ).rotateX( - Math.PI / 2 )
	const material = new THREE.PointsMaterial( { size: 0.5, color: 0xffff00 } )
	scene.add( new THREE.Points( geometry, material ) )
}

for ( let i = 0; i < coordinates.length - 1; i++ ) {

	const A = new THREE.Vector3( ...coordinates[ i ] )
	const B = new THREE.Vector3( ...coordinates[ i + 1 ] )

	const { indices, vertices, normals, uvs } = buildPlane( 1, 1, A, B )

	const geometry = new THREE.BufferGeometry()

	geometry.setIndex( indices )
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
	geometry.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
	geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )

	const position = geometry.attributes.position

	for ( let i = 0; i < position.count; i++ ) {

		const v3 = new THREE.Vector3().fromBufferAttribute( position, i )

		position.setXYZ( i, ...v3 )
	}

	scene.add( new THREE.Mesh( geometry, new THREE.MeshBasicMaterial() ) )
}

const v1 = new THREE.Vector3( 0, 0, 2 )
const v2 = new THREE.Vector3( 0, 0.1, 1 )

const direction = new THREE.Vector3()
direction.subVectors( v2, v1 ).normalize()
