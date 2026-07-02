import service from "../services/service.config"

const nearbyHouseNumberOffsets = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10]

function uniqueCandidates(candidates) {
  const seenQueries = new Set()

  return candidates.filter((candidate) => {
    if (!candidate.query || seenQueries.has(candidate.query)) {
      return false
    }

    seenQueries.add(candidate.query)
    return true
  })
}

function getSpellingCandidates(address, matchType) {
  const normalizedStreetSuffix = address
    .replaceAll("strase", "strasse")
    .replaceAll("Strase", "Strasse")
    .replace(/([a-zäöüß]+)trasse\b/gi, "$1strasse")
    .replace(/([a-zäöüß]+)str\.?\b/gi, "$1strasse")

  return [
    { matchType, query: normalizedStreetSuffix },
    { matchType, query: address },
    { matchType, query: normalizedStreetSuffix.replaceAll("\u00df", "ss") },
    { matchType, query: normalizedStreetSuffix.replaceAll("stra\u00dfe", "strasse") },
    { matchType, query: normalizedStreetSuffix.replaceAll("Stra\u00dfe", "Strasse") },
    { matchType, query: normalizedStreetSuffix.replaceAll("\u00f6", "oe") },
    { matchType, query: normalizedStreetSuffix.replaceAll("\u00d6", "Oe") },
  ]
}

function getLocalAddressCandidates(address) {
  if (/\bberlin\b/i.test(address)) {
    return []
  }

  return getSpellingCandidates(`${address}, Berlin`, "exact")
}

function getNearbyHouseNumberCandidates(address) {
  const houseNumberMatch = address.match(/\b(\d+[a-zA-Z]?)\b/)

  if (!houseNumberMatch) {
    return []
  }

  const [houseNumberToken] = houseNumberMatch
  const numericHouseNumber = Number.parseInt(houseNumberToken, 10)

  if (!Number.isFinite(numericHouseNumber)) {
    return []
  }

  return nearbyHouseNumberOffsets
    .map((offset) => numericHouseNumber + offset)
    .filter((candidateNumber) => candidateNumber > 0)
    .map((candidateNumber) => address.replace(houseNumberToken, String(candidateNumber)))
    .flatMap((candidateAddress) => getSpellingCandidates(candidateAddress, "nearby"))
}

function getStreetLevelCandidate(address) {
  return address
    .replace(/\b\d+[a-zA-Z]?\b\s*,?\s*/, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function getAddressCandidates(address) {
  return uniqueCandidates([
    ...getLocalAddressCandidates(address),
    ...getSpellingCandidates(address, "exact"),
    ...getNearbyHouseNumberCandidates(address),
    ...getSpellingCandidates(getStreetLevelCandidate(address), "street"),
  ])
}

async function fetchCoordinates(candidate) {
  let response

  try {
    response = await service.get("/geocode", {
      params: { q: candidate.query },
    })
  } catch {
    throw new Error("Could not search for this address.")
  }

  const results = response.data
  const result = results[0]
  const lat = Number.parseFloat(result?.lat)
  const lng = Number.parseFloat(result?.lon)
  const displayName = result?.display_name || candidate.query

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  const houseNumber = candidate.query.match(/\b\d+[a-zA-Z]?\b/)?.[0]
  const matchType = houseNumber && !displayName.includes(houseNumber)
    ? "street"
    : candidate.matchType

  return {
    label: displayName,
    lat,
    lng,
    matchType,
    query: candidate.query,
  }
}

export async function resolveAddress(address) {
  const trimmedAddress = address.trim()

  if (!trimmedAddress) {
    throw new Error("Enter an address first.")
  }

  const candidates = getAddressCandidates(trimmedAddress)

  for (const candidate of candidates) {
    const coordinates = await fetchCoordinates(candidate)

    if (coordinates) {
      return coordinates
    }
  }

  throw new Error("No position found for this address.")
}

export async function geocodeAddress(address) {
  return resolveAddress(address)
}
