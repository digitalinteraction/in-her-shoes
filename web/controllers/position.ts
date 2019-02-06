import Axios, { AxiosResponse } from "axios"
import { IPosition } from './../schemas/position'
import models from './../models'

/**
 * Get lat and longs for start and end city
 * @param  start Start city
 * @param  end   End city
 * @return       [lat, long]
 */
export async function getStartAndEndPositions(start: string, end: string): Promise<IPosition[]> {
  if (start.length < 1 || end.length < 0) {
    throw new Error('city names cannot be empty')
  }

  let positionStart: IPosition
  let positionEnd: IPosition

  try {
    positionStart = await getGeocodeFromCity(start)
    positionEnd = await getGeocodeFromCity(end)
  } catch (e) {
    console.error(e)
  }

  return [
    positionStart,
    positionEnd
  ]
}

/**
 * Return a url for a city geocode lookup
 * @param  city city
 * @return      URL
 */
export function getURL(city: string): string {
  city = encodeURI(city)
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE}`
}

/**
 * Get position from google
 * @param  url url for request
 * @return     [description]
 */
export async function getGeocodeFromCity(city: string): Promise<IPosition> {
  city = city.replace('United Kingdom', 'UK')
    .replace('England', 'UK')
    .replace('Scotland', 'UK')
    .replace('Scottland', 'UK')
    .replace('Wales', 'UK')
    .replace('Northern Ireland', 'UK')
    .toLowerCase()
    .split(',')
    .join(', ')

  // Check if already exists before completing lookup
  const storedCity = await getPositionByCity(city)
  if (storedCity) return storedCity

  const url = getURL(city)
  const response: AxiosResponse = await Axios.get(url)

  return await createPosition({
    lat: parseFloat(response.data.results[0].geometry.location.lat),
    lng: parseFloat(response.data.results[0].geometry.location.lng),
    gid: response.data.results[0].place_id,
    textAddress: city
  })
}

/**
 * Store a position in the database
 * @param  positionData [description]
 * @return              [description]
 */
export async function createPosition(positionData: {
  lat: number,
  lng: number,
  gid: string,
  textAddress: string
}): Promise<IPosition> {
  let position: IPosition
  try {
    position = await models.Position.create({
      lat: positionData.lat,
      lng: positionData.lng,
      gid: positionData.gid,
      textAddress: positionData.textAddress
    })
  } catch (e) {
    /**
     * If there is a mongo duplicate key, return the position with matching latitude
     * @param  {lat [description]
     * @return      [description]
     */
    return await models.Position.findOne({lat: positionData.lat})
  }

  return position
}

/**
 * Get position from a text address
 * @param  city city, in the format 'city,country'
 * @return
 */
export async function getPositionByCity(city: string): Promise<IPosition> {
  return models.Position.findOne({ textAddress: city })
}
