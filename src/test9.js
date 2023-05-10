import "./main.css"
import * as THREE from "three"
import { setup } from "./setup"

class PlaneGeometry extends THREE.BufferGeometry {

	constructor(
		elevation = 0,
		height = 1,
		gridX = 1,
		gridY = 1,
		start = new THREE.Vector3( 0, 0, 0 ),
		end = new THREE.Vector3( 1, 0, 0 ),
	) {

		super()

		const indices = []
		const vertices = []
		const normals = []
		const uvs = []

		const v3 = new THREE.Vector3()

		const at = t => v3.subVectors( end, start ).multiplyScalar( t ).add( start )

		for ( let iy = 0; iy <= gridY; iy ++ ) {

			const y = iy * height / gridY - elevation - height

			for ( let ix = 0; ix <= gridX; ix ++ ) {

				at( ix * 1 / gridX )

				vertices.push( v3.x, - y, - v3.y )

				normals.push( 0, 0, 1 )

				uvs.push( ix / gridX )
				uvs.push( 1 - ( iy / gridY ) )
			}
		}

		for ( let iy = 0; iy < gridY; iy ++ ) {

			for ( let ix = 0; ix < gridX; ix ++ ) {

				const a = ix + ( gridX + 1 ) * iy
				const b = ix + ( gridX + 1 ) * ( iy + 1 )
				const c = ( ix + 1 ) + ( gridX + 1 ) * ( iy + 1 )
				const d = ( ix + 1 ) + ( gridX + 1 ) * iy

				indices.push( a, b, d, b, c, d )
			}
		}

		this.setIndex( indices )
		this.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
		this.setAttribute( "normal", new THREE.Float32BufferAttribute( normals, 3 ) )
		this.setAttribute( "uv", new THREE.Float32BufferAttribute( uvs, 2 ) )
	}
}

const { scene, renderer } = setup()

scene.add( new THREE.GridHelper( 20, 20, 0x606060, 0x303030 ) )

// const map = new THREE.TextureLoader().load( "0518-3-1024x1024.jpg" )
const map = new THREE.TextureLoader().load( "uvcheck.jpg" )
map.colorSpace = THREE.SRGBColorSpace
map.anisotropy = renderer.capabilities.getMaxAnisotropy()
map.wrapS = map.wrapT = THREE.RepeatWrapping

const coordinates = [
	[ 0, 0, 0 ],
	[ 2, 0, 0 ],
	[ 3, 2, 0 ],
	[ 5, 2, 0 ],
	[ 5, 5, 0 ],
	[ 0, 5, 0 ],
	[ 0, 0, 0 ],
]

{
	const geometry = new THREE.BufferGeometry().setAttribute( "position", new THREE.Float32BufferAttribute( coordinates.flat(), 3 ) ).rotateX( - Math.PI / 2 )
	const material = new THREE.PointsMaterial( { size: 0.25, color: 0xffff00 } )
	const mesh = new THREE.Points( geometry, material )
	scene.add( mesh )
}

const elevation = 0
const height = 2
const widthSegments = 4
const heightSegments = 4

for ( let i = 0; i < coordinates.length - 1; i++ ) {

	const start = new THREE.Vector3( ...coordinates[ i ] )
	const end = new THREE.Vector3( ...coordinates[ i + 1 ] )

	const geometry = new PlaneGeometry(
		elevation,
		height,
		widthSegments,
		heightSegments,
		start,
		end,
		1,
	)

	geometry.toNonIndexed()

	const material = new THREE.MeshBasicMaterial( {
		map,
		wireframe: true,
		side: 2,
	} )

	const mesh = new THREE.Mesh( geometry, material )
	scene.add( mesh )
}
