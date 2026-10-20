import Buildings from './Buildings'
import { buildings } from './places'
import { Stupa, Pagoda, Boats, Peaks } from './Landmarks'
import Trees from './Trees'
import PrayerFlags from './PrayerFlags'
import Birds from './Birds'
import { SPOTS } from './spots'

/** Everything that makes the valley feel inhabited. Not to scale, on purpose. */
export default function Props() {
  return (
    <group>
      <Buildings specs={buildings} />
      <Pagoda {...SPOTS.pashupati} />
      <Stupa {...SPOTS.boudhanath} />
      <Stupa {...SPOTS.peacePagoda} scale={1.3} />
      <Stupa {...SPOTS.abcChorten} scale={0.45} />
      <Boats />
      <Peaks />
      <Trees />
      <PrayerFlags />
      <Birds />
    </group>
  )
}
