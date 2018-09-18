import Axios, { AxiosResponse } from "axios"
import { Position } from "./../position"

/**
 * Get lat and longs for start and end city
 * @param  start Start city
 * @param  end   End city
 * @return       [lat, long]
 */
export async function getLatLongsFromCity(start: string, end: string): Promise<Position[]> {
  if (start.length < 1 || end.length < 0) {
    throw new Error('city names cannot be empty')
  }

  const UrlStart = getURL(start)
  const UrlEnd = getURL(end)

  console.log(UrlStart, UrlEnd)

  const positionStart = await getPosition(UrlStart)
  const positionEnd = await getPosition(UrlEnd)

  console.log(positionStart, positionEnd)

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
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE}`
}

/**
 * Get position from google
 * @param  url url for request
 * @return     [description]
 */
export async function getPosition(url: string): Promise<Position> {
  const response: AxiosResponse = await Axios.get(url)
  const rLocation = response.data.results[0].geometry.location
  return new Position(rLocation.lat, rLocation.lng)
}
