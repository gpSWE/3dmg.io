import { flatten } from "earcut"

const defaultParameters = {
	centerOfMass: null,
}

class Polygon {

	constructor( feature, centerOfMass ) {

		this.#initFeature( feature, centerOfMass )
	}

	#initFeature( feature, centerOfMass ) {

		if ( feature.geometry.type !== "Polygon" ) {

			throw new Error( "The geometry of the feature must be of Polygon type." )
		}

		this.type = "Polygon"

		feature = structuredClone( feature )

		const coords = feature.geometry.coordinates

		this.exterior = coords.shift()
		this.interior = coords
		this.coordinates = [ this.exterior, ...this.interior ]

		this.countOfPositions = this.exterior.length + this.interior.flat().length

		const params = feature.properties.maplify || {}

		this.params = params

		this.earcut = flatten( [ this.exterior, ...this.interior ] )
	}
}

export {
	Polygon,
}
