
import { gql, useQuery } from '@apollo/client'
import { faStar, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { AsyncLoader } from '../AsyncLoader/AsyncLoader'
import { Separator } from '../Separator/Separator'
import classes from './CoasterReviewSummarySection.module.scss'

/**
 * 
 **/
interface CoasterReviewSummarySectionProps {
    /**
     * Unique identifier for coaster whose review summary data is to be displayed, also serving as coaster's URL subdirectory.
     **/
    coasterUrl: string;

    /**
     * Max width of tag/keyword progress bar.
     * E.G. 90% of reviews mentioning a keyword means that keyword's progress bar width will be 90% of the max width.
     **/
    reviewTagLineMaxWidth?: number;
}

/**
 * Displays total number of reviewers, average rating, and common tags/keywords for coaster.
 **/
export const CoasterReviewSummarySection: React.FC<CoasterReviewSummarySectionProps> = ({ coasterUrl, reviewTagLineMaxWidth = 100 }) => {
    const [reviewRatingAverage, setReviewRatingAverage] = useState<number>(0)
    const [reviewCount, setReviewCount] = useState<number>(0)
    const [reviewTags, setReviewTags] = useState<any[]>()
    const [loaded, setLoaded] = useState<boolean>(false)

    const { data } = useQuery(gql`{
        reviews(coasterUrl: "${coasterUrl}") {
            title,
            body,
            rating,
            reviewTags {
                tag
            }
        }
    }`)

    useEffect(() => {
        if (!data)
            return
            
        const reviews = [...data?.reviews]
        const dbReviewCount = reviews.length
        const dbReviewRatingAverage = reviews.reduce((sum, r) => sum + r.rating, 0) / dbReviewCount

        const dbReviewTags = {}
        reviews.forEach((review) => {
            review.reviewTags.forEach((reviewTag) => {
                dbReviewTags[reviewTag.tag] = (dbReviewTags[reviewTag.tag] || 0) + 1
            })
        })
        Object.keys(dbReviewTags).forEach((tag) => {
            dbReviewTags[tag] = Math.round(dbReviewTags[tag] / dbReviewCount * 100)
        })

        const dbReviewTagsList = Object.keys(dbReviewTags).map((tag) => Object.create({
            name: tag,
            value: dbReviewTags[tag]
        }))

        setReviewCount(dbReviewCount)
        setReviewRatingAverage(dbReviewRatingAverage)
        setReviewTags(dbReviewTagsList)
        setLoaded(true)
    }, [data])

    return <>
        {loaded && <>
            <div className={classes.ratingStatsContainer}>
                <FontAwesomeIcon icon={faStar} className={classes.icon} />
                {reviewCount > 0  && <>{reviewRatingAverage.toFixed(1)} <span className={classes.ratingStatsDescription}>out of 5</span></>}
                {reviewCount == 0 && <span className={classes.ratingStatsDescription}>&nbsp;No Ratings</span>}
                &nbsp;&nbsp;<Separator />&nbsp;&nbsp;
                <FontAwesomeIcon icon={faUser} className={classes.icon} /> {reviewCount.toLocaleString()} <span className={classes.ratingStatsDescription}>reviews</span>
            </div>
            <div className={classes.reviewTagContainer}>
                {reviewTags?.map((reviewTag) => (
                <div className={classes.reviewTag} key={reviewTag.name} title={`${reviewTag.value}% of reviewers tagged ${reviewTag.name}`}>
                    <div className={classes.reviewTagName}>{reviewTag.name}</div>
                    <div className={classes.reviewTagPerc}>({reviewTag.value}%)</div>
                    <div className={classes.reviewTagLine} style={{ width: `${reviewTag.value / 100 * reviewTagLineMaxWidth}px` }}></div>
                </div>))}
            </div>
        </>}

        {!loaded && <div className={classes.async}>
            <div className={classes.ratingStatsContainer}>
                <FontAwesomeIcon icon={faStar} className={classes.icon} />
                <AsyncLoader size={3} />
                &nbsp;&nbsp;<Separator />&nbsp;&nbsp;
                <FontAwesomeIcon icon={faUser} className={classes.icon} />
                <AsyncLoader size={3} />
            </div>
            <div className={classes.reviewTagContainer}>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
                <div className={classes.reviewTag}><AsyncLoader size={12} /></div>
            </div>
        </div>}
    </>
}
