import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"
const indices = []
const vertices = []
const normals = []
const uvs = []
let numberOfVertices = 0
let groupStart = 0

let width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1

const geometry = new THREE.BufferGeometry()

function buildPlane(
	u,
	v,
	w,
	udir,
	vdir,
	width,
	height,
	depth,
	gridX,
	gridY,
	materialIndex,
	angle,
	P,
) {

	const segmentWidth = width / gridX;
	const segmentHeight = height / gridY;

	const widthHalf = width / 2;
	const heightHalf = height / 1;
	const depthHalf = depth / 2;

	const gridX1 = gridX + 1;
	const gridY1 = gridY + 1;

	let vertexCounter = 0;
	let groupCount = 0;

	const vector = new THREE.Vector3();

	// generate vertices, normals and uvs

	for ( let iy = 0; iy < gridY1; iy ++ ) {

		const y = iy * segmentHeight - heightHalf;

		for ( let ix = 0; ix < gridX1; ix ++ ) {

			const x = ix * segmentWidth - widthHalf;

			// set values to correct vector component

			vector[ u ] = x * udir;
			vector[ v ] = y * vdir;
			vector[ w ] = depthHalf;

			// now apply vector to vertex buffer

			vector.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), angle )
			vector.add( P )

			vertices.push( vector.x, vector.y, vector.z );

			// set values to correct vector component

			vector[ u ] = 0;
			vector[ v ] = 0;
			vector[ w ] = depth > 0 ? 1 : - 1;

			// now apply vector to normal buffer

			normals.push( vector.x, vector.y, vector.z );

			// uvs

			uvs.push( ix / gridX );
			uvs.push( 1 - ( iy / gridY ) );

			// counters

			vertexCounter += 1;

		}

	}

	// indices

	// 1. you need three indices to draw a single face
	// 2. a single segment consists of two faces
	// 3. so we need to generate six (2*3) indices per segment

	for ( let iy = 0; iy < gridY; iy ++ ) {

		for ( let ix = 0; ix < gridX; ix ++ ) {

			const a = numberOfVertices + ix + gridX1 * iy;
			const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
			const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
			const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

			// faces

			indices.push( a, b, d );
			indices.push( b, c, d );

			// increase counter

			groupCount += 6;

		}
	}

	// add a group to the geometry. this will ensure multi material support

	geometry.addGroup( groupStart, groupCount, materialIndex );

	// calculate new start value for groups

	groupStart += groupCount;

	// update total number of vertices

	numberOfVertices += vertexCounter;
}

const { scene, renderer } = setup()

const points = [
	// new THREE.Vector3( 0, 0, 0 ),
	// new THREE.Vector3( 4, 0, 0 ),
	// new THREE.Vector3( 0, 0, 4 ),
	// new THREE.Vector3( 0, 0, 0 ),

	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 4, 0, 0 ),
	new THREE.Vector3( 4, 0, 4 ),
	new THREE.Vector3( 4, 0, 8 ),
	new THREE.Vector3( 0, 0, 8 ),
]

{
	const geometry = new THREE.BufferGeometry().setFromPoints( points )
	const material = new THREE.PointsMaterial( { size: 0.25 } )
	scene.add( new THREE.Points( geometry, material ) )
}

let q = new THREE.Quaternion()

for ( let i = 0; i < points.length - 1; i++ ) {

	const A = points[ i ]
	const B = points[ i + 1 ]
	const C = new THREE.Vector3().addVectors( A, B ).divideScalar( 2 )

	// const A = points[ i ]
	// const B = points[ i + 1 ]

	// const quaternion = new THREE.Quaternion()

	// quaternion.setFromUnitVectors( A, B )

	// const angle = A.angleTo( C )
	const angle = Math.PI - B.angleTo( C )

	// q = quaternion

	// console.log( angle )

	width = 0
	depth = A.distanceTo( B )

	console.log( angle )

	buildPlane(
		"z",
		"y",
		"x",
		1,
		- 1,
		depth,
		height,
		width,
		depthSegments,
		heightSegments,
		0,
		angle,
		C,
	)

	// console.log( A.distanceTo( B ) )
}

// buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0 ); // px
// buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ); // nx
// buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4 ); // pz
// buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5 ); // nz



geometry.setIndex( indices )
geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
geometry.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )

const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
// const map = new THREE.TextureLoader().load( "0518-3-1024x1024.jpg" )
map.colorSpace = THREE.SRGBColorSpace
map.anisotropy = renderer.capabilities.getMaxAnisotropy()
map.wrapS = map.wrapT = THREE.RepeatWrapping
map.repeat.set( 4, 1 )

const material = new THREE.MeshBasicMaterial( {
	map,
	transparent: false,
	opacity: 0.25,
	// side: 2,
} )

scene.add( new THREE.Mesh( geometry, material ) )
