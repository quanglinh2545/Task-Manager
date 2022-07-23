import { Issue, getIssue } from '/@/api/issue'
import { getMemberAndCategory } from '/@/api/project'
export interface OptionItem {
  value: number
  label: string
}
export function useMemberAndCategory(
  projectKey: string,
  issueId?: number | string
) {
  const [members, setMembers] = useState<OptionItem[]>([])
  const [categories, setCategories] = useState<OptionItem[]>([])
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingIssue, setLoadingIssue] = useState(true)
  const isMounted = useRef(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response: {
        members: OptionItem[]
        categories: OptionItem[]
      } = await getMemberAndCategory(projectKey)
      if (isMounted.current) {
        setMembers(response.members)
        setCategories(response.categories)
        issueId && fetchIssue()
      }
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchIssue = useCallback(async () => {
    try {
      const response = await getIssue(issueId!, projectKey)
      setIssue(response)
    } catch (error: any) {
      console.log(error)
    } finally {
      setTimeout(() => (isMounted.current ? setLoadingIssue(false) : null), 250)
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchData()
    }

    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    members,
    categories,
    loading,
    issue,
    loadingIssue,
  }
}
