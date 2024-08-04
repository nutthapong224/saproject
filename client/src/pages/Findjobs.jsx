import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomButton, Header, JobCard, ListBox } from "../components";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { BiBriefcaseAlt2 } from "react-icons/bi";
import { experience, jobTypes } from "../utills/data";
import { BsStars } from "react-icons/bs";
import { apiRequest, updateURL } from "../utills";

const Findjobs = () => {
  const [sort, setSort] = useState("Newest");
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [recordCount, setRecordCount] = useState(0);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [filterJobTypes, setFilterJobTypes] = useState([]);
  const [filterExp, setFilterExp] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setIsFetching(true);
    const newUrl = updateURL({
      pageNum: page,
      query: searchQuery,
      cmpLoc: jobLocation,
      sort: sort,
      navigate: navigate,
      location: location,
      jobType: filterJobTypes.join(","),
      exp: filterExp.join("-"),
    });

    try {
      const res = await apiRequest({
        url: "jobs" + newUrl,
        method: "GET",
      });

      setNumPage(res?.numOfPage);
      setRecordCount(res?.totalJobs);
      setData(res?.data);
      setIsFetching(false);
    } catch (error) {
      console.log(error);
      setIsFetching(false);
    }
  };

  const filterJobs = (val) => {
    if (filterJobTypes?.includes(val)) {
      setFilterJobTypes(filterJobTypes.filter((el) => el !== val));
    } else {
      setFilterJobTypes([...filterJobTypes, val]);
    }
  };

const filterExperience = (e) => {
  const { value, checked } = e.target;
  let newFilterExp = [...filterExp];

  // Add or remove experience range based on checkbox state
  if (checked) {
    newFilterExp.push(value);
  } else {
    newFilterExp = newFilterExp.filter((exp) => exp !== value);
  }

  // Initialize ranges
  const ranges = newFilterExp.map((el) => {
    if (el.includes("Over")) {
      const min = parseInt(el.split(" ")[1], 10);
      return { min, max: Infinity };
    } else {
      const [min, max] = el.split("-").map(Number);
      return { min, max };
    }
  });

  // Merge overlapping or adjacent ranges
  if (ranges.length > 0) {
    ranges.sort((a, b) => a.min - b.min);
    let mergedRanges = [];
    let currentRange = ranges[0];

    for (let i = 1; i < ranges.length; i++) {
      if (currentRange.max >= ranges[i].min - 1) {
        // Merge ranges
        currentRange.max = Math.max(currentRange.max, ranges[i].max);
      } else {
        mergedRanges.push(currentRange);
        currentRange = ranges[i];
      }
    }
    mergedRanges.push(currentRange);

    // Convert merged ranges to a single string
    const finalExpRange = mergedRanges
      .map((range) => {
        if (range.max === Infinity) {
          return `Over ${range.min}`;
        }
        return `${range.min}-${range.max}`;
      })
      .join("-");

    // Update the filter experience to include the combined range
    setFilterExp([finalExpRange]);
  } else {
    // No ranges selected
    setFilterExp([]);
  }
};







  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchJobs();
  };

  const handleShowmore = async (e) => {
    e.preventDefault();
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchJobs();
  }, [sort, filterJobTypes, filterExp, page]);

  return (
    <div>
      <Header
        title="Find Your Dream Job with Ease"
        type="home"
        handleClick={handleSearchSubmit}
        setSearchQuery={setSearchQuery}
        location={jobLocation}
        setLocation={setJobLocation}
      />
      <div className="container mx-auto flex gap-6 2xl:gap-10 md:px-5 py-0 md:py-6 bg-[#f7fdfd]">
        <div className="hidden md:flex flex-col w-1/6 h-fit bg-white shadow-sm">
          <p className="text-lg font-semibold text-slate-600">Filter Search</p>

          <div className="py-2">
            <div className="flex justify-between mb-3">
              <p className="flex items-center gap-2 font-semibold">
                <BiBriefcaseAlt2 />
                Job Type
              </p>

              <button>
                <MdOutlineKeyboardArrowDown />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {jobTypes.map((jobType, index) => (
                <div key={index} className="flex gap-2 text-sm md:text-base">
                  <input
                    type="checkbox"
                    value={jobType}
                    className="w-4 h-4"
                    onChange={(e) => filterJobs(e.target.value)}
                  />
                  <span>{jobType}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-2 mt-4">
            <div className="flex justify-between mb-3">
              <p className="flex items-center gap-2 font-semibold">
                <BsStars />
                Experience
              </p>

              <button>
                <MdOutlineKeyboardArrowDown />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {experience.map((exp) => (
                <div key={exp.title} className="flex gap-3">
                  <input
                    type="checkbox"
                    value={exp.value}
                    className="w-4 h-4"
                    onChange={filterExperience}
                  />
                  <span>{exp.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-5/6 px-5 md:px-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm md:text-base">
              Showing: <span className="font-semibold">{recordCount}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-0 md:gap-2 md:items-center">
              <p className="text-sm md:text-base">Sort By:</p>

              <ListBox sort={sort} setSort={setSort} />
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-4">
            {data?.slice(0, 6).map((job, index) => {
              const data = {
                name: job?.company?.name,
                logo: job?.company?.profileUrl,
                ...job,
              };

              return <JobCard job={data} key={index} />;
            })}
          </div>

          {numPage > page && !isFetching && (
            <div className="w-full flex items-center justify-center pt-16">
              <CustomButton
                onChange={handleShowmore}
                title="Load More"
                containerStyles="text-blue-600 py-1.5 px-5 focus:outline-none hover:bg-blue-700 hover:text-white rounded-full text-base border border-blue-600"
                onClick={() => setPage((prev) => prev + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Findjobs;
